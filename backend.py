from flask import Flask, render_template, request, jsonify, session
import sqlite3

app = Flask(__name__)
app.secret_key = "secret123"

def get_db():
    return sqlite3.connect("database.db")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT role FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    )
    user = cur.fetchone()

    if user:
        session["user"] = data["username"]
        session["role"] = user[0]
        session["cart"] = []
        return jsonify({"success": True, "role": user[0]})
    return jsonify({"success": False})


@app.route("/add_event", methods=["POST"])
def add_event():
    data = request.json
    db = get_db()
    db.execute(
        "INSERT INTO events(name, price) VALUES(?,?)",
        (data["name"], data["price"])
    )
    db.commit()
    return jsonify({"success": True})


@app.route("/events")
def events():
    db = get_db()
    return jsonify(db.execute(
        "SELECT id,name,price FROM events"
    ).fetchall())


@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    cart = session.get("cart", [])
    cart.append(request.json)
    session["cart"] = cart
    return jsonify(cart)

@app.route("/cart")
def cart():
    return jsonify(session.get("cart", []))


@app.route("/pay", methods=["POST"])
def pay():
    cart = session.get("cart", [])
    if not cart:
        return jsonify({"success": False})

    total = sum(float(i["price"]) for i in cart)
    items = ",".join(i["name"] for i in cart)

    db = get_db()
    db.execute(
        "INSERT INTO orders(username,items,amount,status) VALUES(?,?,?,?)",
        (session["user"], items, total, "Paid")
    )
    db.commit()

    session["cart"] = []
    return jsonify({"success": True, "amount": total})


@app.route("/orders")
def orders():
    db = get_db()
    data = db.execute(
        "SELECT items,amount,status FROM orders WHERE username=?",
        (session["user"],)
    ).fetchall()
    return jsonify(data)


@app.route("/logout")
def logout():
    session.clear()
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)
