
from flask import (
    Flask, render_template, request,
    redirect, url_for, flash, session
)
import mysql.connector
from mysql.connector import Error
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from itsdangerous import (
    URLSafeTimedSerializer,
    BadSignature,
    SignatureExpired
)
from email.message import EmailMessage
import smtplib
import os


app = Flask(__name__)

# Use a long, private secret key.
app.secret_key = os.getenv(
    "FLASK_SECRET_KEY",
    "change-this-to-a-long-random-secret-before-deployment"
)


# ---------------- MYSQL CONFIGURATION ----------------

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Terath#12maa",
    "database": "clinical_analysis_db"
}


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


# ---------------- EMAIL CONFIGURATION ----------------

RESET_TOKEN_MAX_AGE = 15 * 60  # 15 minutes


def get_reset_serializer():
    return URLSafeTimedSerializer(app.secret_key)


def send_reset_email(recipient_email, reset_link):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        raise RuntimeError(
            "Configure MAIL_USERNAME and MAIL_PASSWORD first."
        )

    message = EmailMessage()
    message["Subject"] = "MedOrganize AI - Password Reset"
    message["From"] = sender_email
    message["To"] = recipient_email

    message.set_content(
        "Hello,\n\n"
        "We received a request to reset your MedOrganize AI password.\n\n"
        f"Click this link to reset your password:\n{reset_link}\n\n"
        "This link expires in 15 minutes.\n"
        "If you did not request this, ignore this email."
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)


# ---------------- CREATE USERS TABLE ----------------

def init_db():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()
        print("MySQL connected. Users table is ready.")

    except Error:
        app.logger.exception("Database initialization failed")
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ---------------- LANDING PAGE ----------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------- REGISTRATION PAGE ----------------

@app.route("/register", methods=["GET", "POST"])
def register_page():

    if request.method == "GET":
        return render_template("register.html")

    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")

    if not name or not email or not password:
        flash("Please fill in all required fields.", "error")
        return redirect(url_for("register_page"))

    if len(name) > 100 or len(email) > 255:
        flash("Name or email is too long.", "error")
        return redirect(url_for("register_page"))

    if password != confirm_password:
        flash("Passwords do not match.", "error")
        return redirect(url_for("register_page"))

    if len(password) < 8:
        flash("Password must contain at least 8 characters.", "error")
        return redirect(url_for("register_page"))

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            flash("Email already registered.", "error")
            return redirect(url_for("register_page"))

        password_hash = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            """,
            (name, email, password_hash)
        )

        connection.commit()

        flash("Registration successful. Please log in.", "success")
        return redirect(url_for("login_page"))

    except Error:
        if connection is not None and connection.is_connected():
            connection.rollback()

        app.logger.exception("Registration failed")
        flash("Registration failed. Please check your database.", "error")
        return redirect(url_for("register_page"))

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ---------------- LOGIN PAGE ----------------

@app.route("/login", methods=["GET", "POST"])
def login_page():

    if request.method == "GET":
        return render_template("login.html")

    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")

    if not email or not password:
        flash("Please enter your email and password.", "error")
        return redirect(url_for("login_page"))

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email, password_hash
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        if user and check_password_hash(
            user["password_hash"], password
        ):
            session.clear()
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            session["user_email"] = user["email"]

            return redirect(url_for("home"))

        flash("Invalid email or password.", "error")
        return redirect(url_for("login_page"))

    except Error:
        app.logger.exception("Login failed")
        flash("Unable to log in. Check your database connection.", "error")
        return redirect(url_for("login_page"))

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ---------------- FORGOT PASSWORD ----------------

@app.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():

    if request.method == "GET":
        return render_template("forgot_password.html")

    email = request.form.get("email", "").strip().lower()

    if not email:
        flash("Please enter your registered email.", "error")
        return redirect(url_for("forgot_password"))

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        # Do not reveal whether an email is registered.
        if user:
            token = get_reset_serializer().dumps(
                email,
                salt="password-reset"
            )

            reset_link = url_for(
                "reset_password",
                token=token,
                _external=True
            )

            send_reset_email(email, reset_link)

        flash(
            "If this email is registered, a reset link will be sent.",
            "success"
        )
        return redirect(url_for("login_page"))

    except Exception:
        app.logger.exception("Forgot password failed")
        flash(
            "Unable to process the request. Please try again later.",
            "error"
        )
        return redirect(url_for("forgot_password"))

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ---------------- RESET PASSWORD ----------------

@app.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):

    try:
        email = get_reset_serializer().loads(
            token,
            salt="password-reset",
            max_age=RESET_TOKEN_MAX_AGE
        )

    except SignatureExpired:
        flash(
            "Your reset link has expired. Please request a new one.",
            "error"
        )
        return redirect(url_for("forgot_password"))

    except BadSignature:
        flash("Invalid reset link. Please request a new one.", "error")
        return redirect(url_for("forgot_password"))

    if request.method == "GET":
        return render_template("reset_password.html")

    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")

    if len(password) < 8:
        flash("Password must contain at least 8 characters.", "error")
        return redirect(url_for("reset_password", token=token))

    if password != confirm_password:
        flash("Passwords do not match.", "error")
        return redirect(url_for("reset_password", token=token))

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if not cursor.fetchone():
            flash("Account not found.", "error")
            return redirect(url_for("forgot_password"))

        password_hash = generate_password_hash(password)

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s
            WHERE email = %s
            """,
            (password_hash, email)
        )

        connection.commit()

        flash(
            "Password reset successful. Please log in.",
            "success"
        )
        return redirect(url_for("login_page"))

    except Error:
        if connection is not None and connection.is_connected():
            connection.rollback()

        app.logger.exception("Password reset failed")
        flash("Unable to reset password. Please try again.", "error")
        return redirect(url_for("reset_password", token=token))

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()


# ---------------- HOME PAGE ----------------

@app.route("/home")
def home():

    if "user_id" not in session:
        flash("Please log in first.", "error")
        return redirect(url_for("login_page"))

    return render_template("home.html")


# ---------------- LOGOUT ----------------

@app.route("/logout")
def logout():
    session.clear()
    flash("You have logged out successfully.", "success")
    return redirect(url_for("index"))


# ---------------- RUN APPLICATION ----------------

if __name__ == "__main__":
    init_db()
    app.run(debug=True)

