let total = 0;


function login() {
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert("Invalid Login");
            return;
        }

        document.getElementById("login").classList.add("hidden");
        document.getElementById(data.role).classList.remove("hidden");

        if (data.role === "user") {
            loadEvents();
            loadOrders();
        }
    });
}


function logout() {
    fetch("/logout").then(() => location.reload());
}


function addEvent() {
    fetch("/add_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: ename.value,
            price: eprice.value
        })
    })
    .then(() => alert("Event Added Successfully"));
}


function loadEvents() {
    fetch("/events")
        .then(res => res.json())
        .then(data => {
            events.innerHTML = "";
            data.forEach(e => {
                events.innerHTML += `
                    <li>${e[1]} - ₹${e[2]}
                    <button onclick="addToCart('${e[1]}','${e[2]}')">
                        Add to Cart
                    </button></li>
                `;
            });
            loadCart();
        });
}


function addToCart(name, price) {
    fetch("/add_to_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
    })
    .then(loadCart);
}

function loadCart() {
    fetch("/cart")
        .then(res => res.json())
        .then(cartData => {
            cart.innerHTML = "";
            total = 0;
            cartData.forEach(i => {
                cart.innerHTML += `<li>${i.name} - ₹${i.price}</li>`;
                total += parseFloat(i.price);
            });
            document.getElementById("total").innerText = total;
        });
}


function pay() {
    fetch("/pay", { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Payment Successful! Amount ₹" + data.amount);
                loadCart();
                loadOrders();
            } else {
                alert("Cart is Empty");
            }
        });
}


function loadOrders() {
    fetch("/orders")
        .then(res => res.json())
        .then(data => {
            orders.innerHTML = "";
            data.forEach(o => {
                orders.innerHTML += `
                    <li>
                        Items: ${o[0]} <br>
                        Amount: ₹${o[1]} <br>
                        Status: ${o[2]}
                    </li>
                `;
            });
        });
}
