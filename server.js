const express = require("express");
const cors = require("cors");

const app = express();
const port = 5001;

app.use(express.json()); // Middleware untuk parsing JSON
app.use(cors());

// Data dummy
let menu = [
  // ... (existing menu items)
];

let orders = []; // Menyimpan daftar pesanan

// Rute untuk mendapatkan daftar menu
app.get("/api/menu", (req, res) => {
  res.json(menu);
});

// Rute untuk membuat pesanan
app.post("/api/order", (req, res) => {
  const { menu_id, payment_method } = req.body;

  // Validasi data
  if (!menu_id || !payment_method) {
    return res
      .status(400)
      .json({ message: "Menu ID and payment method are required" });
  }

  const orderedMenu = menu.find((item) => item.id === parseInt(menu_id));

  if (!orderedMenu) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  const newOrder = {
    order_id: orders.length + 1,
    menu_name: orderedMenu.name,
    price: orderedMenu.price,
    payment_method,
  };

  orders.push(newOrder); // Menambahkan order ke dalam daftar pesanan
  res.status(201).json({
    message: "Order placed successfully",
    newOrder,
  });
});

// Rute untuk membatalkan pesanan berdasarkan ID
app.delete("/api/order/:id", (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex((item) => item.order_id === parseInt(id));

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  orders.splice(orderIndex, 1); // Menghapus order dari array
  res.status(200).json({ message: "Order canceled successfully" });
});

// Rute untuk memperbarui pesanan
app.put("/api/order/:id", (req, res) => {
  const { id } = req.params;
  const { menu_id, payment_method } = req.body;

  const orderIndex = orders.findIndex((item) => item.order_id === parseInt(id));

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Validasi data
  if (!menu_id || !payment_method) {
    return res
      .status(400)
      .json({ message: "Menu ID and payment method are required" });
  }

  const orderedMenu = menu.find((item) => item.id === parseInt(menu_id));

  if (!orderedMenu) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  // Update order details
  orders[orderIndex] = {
    order_id: parseInt(id),
    menu_name: orderedMenu.name,
    price: orderedMenu.price,
    payment_method,
  };

  res.json({
    message: "Order updated successfully",
    updatedOrder: orders[orderIndex],
  });
});

// Rute untuk mendapatkan semua pesanan
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Rute untuk mengambil pesanan berdasarkan ID
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  const order = orders.find((item) => item.order_id === parseInt(id));

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
