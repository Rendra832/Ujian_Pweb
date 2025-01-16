import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const AddMenuForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [orders, setOrders] = useState([]);
  const [editingOrderIndex, setEditingOrderIndex] = useState(null);

  const fetchMenuItems = () => {
    axios
      .get("http://localhost:5001/api/menu")
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error("Error fetching menu items:", error));
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:5001/api/orders")
      .then((response) => {
        console.log("Fetched orders:", response.data); // Debugging log
        setOrders(response.data);
      })
      .catch((error) => console.error("Error fetching orders:", error));
  };

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();

    axios
      .get("http://localhost:5001/api/payment-methods")
      .then((response) => setPaymentMethods(response.data))
      .catch((error) => console.error("Error fetching payment methods:", error));
  }, []);

  const handleMenuChange = (menuId) => {
    const menu = menuItems.find((item) => item.id === parseInt(menuId));
    setSelectedMenu(menu || null);
  };

  const handleAddOrder = () => {
    if (!selectedMenu || !selectedPaymentMethod) {
      alert("Please select a menu and payment method.");
      return;
    }

    axios
      .post("http://localhost:5001/api/order", {
        menu_id: selectedMenu.id,
        payment_method: selectedPaymentMethod,
      })
      .then((response) => {
        alert("Order added successfully!");
        fetchOrders(); // Update orders after adding new order
        setSelectedMenu(null);
        setSelectedPaymentMethod("");
      })
      .catch((error) => {
        console.error("There was an error adding the order:", error.response || error.message);
        alert("Error adding order. Please try again.");
      });
  };

  const handleCancelOrder = (index) => {
    const orderId = orders[index].id;
    if (window.confirm("Are you sure you want to cancel this order?")) {
      axios
        .delete(`http://localhost:5001/api/order/${orderId}`)
        .then(() => {
          alert("Order canceled.");
          fetchOrders(); // Refresh orders
        })
        .catch((error) => {
          console.error("Error canceling order:", error.response ? error.response.data : error.message);
          alert("Error canceling order. Please try again.");
        });
    }
  };

  const handleEditOrder = (index) => {
    const order = orders[index];
    setEditingOrderIndex(index);
    setSelectedMenu(menuItems.find((menu) => menu.name === order.menu_name) || null);
    setSelectedPaymentMethod(order.payment_method);
  };

  const handleUpdateOrder = () => {
    if (!selectedMenu || !selectedPaymentMethod) {
      alert("Please select a menu and payment method.");
      return;
    }

    const updatedOrderData = {
      menu_id: selectedMenu.id,
      payment_method: selectedPaymentMethod,
    };

    const orderId = orders[editingOrderIndex].id;

    axios
      .put(`http://localhost:5001/api/order/${orderId}`, updatedOrderData)
      .then((response) => {
        alert("Order updated successfully!");
        fetchOrders(); // Update orders after successful update
        setSelectedMenu(null); // Reset selected menu
        setSelectedPaymentMethod(""); // Reset selected payment method
        setEditingOrderIndex(null); // Reset editing state
      })
      .catch((error) => {
        console.error("Error updating order:", error.response ? error.response.data : error.message);
        alert("Error updating order. Please try again.");
      });
  };

  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const category = item.category || "others";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const pageStyle = {
    backgroundImage: "url('/resto.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    padding: "20px",
  };

  return (
    <div style={pageStyle} className="container">
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "black" }}>Order</h2>
        <h2 style={{ color: "black" }}>In My Restaurant</h2>
        <h4 style={{ color: "black" }}>Stevan, Rendra And Hafiz</h4>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          editingOrderIndex !== null ? handleUpdateOrder() : handleAddOrder();
        }}
      >
        <div>
          <label style={{ color: "white" }}>Menu:</label>
          <select
            value={selectedMenu ? selectedMenu.id : ""}
            onChange={(e) => handleMenuChange(e.target.value)}
          >
            <option value="">Select Menu</option>
            {Object.keys(groupedMenuItems).map((category) => (
              <optgroup key={category} label={category.toUpperCase()}>
                {groupedMenuItems[category].map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ${item.price}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {selectedMenu && (
          <div>
            <p style={{ color: "white" }}>
              <strong>Selected Menu:</strong> {selectedMenu.name}
            </p>
            <p style={{ color: "white" }}>
              <strong>Price:</strong> ${selectedMenu.price}
            </p>
          </div>
        )}
        <div>
          <label style={{ color: "white" }}>Payment Method:</label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          >
            <option value="">Select Payment Method</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.method_name}>
                {method.method_name}
              </option>
            ))}
          </select>
        </div>
        {selectedPaymentMethod === "QRIS" && (
          <div>
            <p style={{ color: "white" }}>
              Scan the QRIS code below to complete your payment:
            </p>
            <img src="/qris.jpg" alt="QRIS Code" style={{ width: "200px" }} />
          </div>
        )}
        <button type="submit">
          {editingOrderIndex !== null ? "Update Order" : "Submit Order"}
        </button>
      </form>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ textAlign: "center", color: "black" }}>Current Orders:</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px", textAlign: "left", color: "black" }}>
                Menu Name
              </th>
              <th style={{ padding: "8px", textAlign: "left", color: "black" }}>
                Price
              </th>
              <th style={{ padding: "8px", textAlign: "left", color: "black" }}>
                Payment Method
              </th>
              <th style={{ padding: "8px", textAlign: "left", color: "black" }}>
                Status
              </th>
              <th style={{ padding: "8px", textAlign: "left", color: "black" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    color: "black",
                  }}
                >
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id}>
                  <td style={{ padding: "8px", color: "black" }}>{order.menu_name}</td>
                  <td style={{ padding: "8px", color: "black" }}>${order.price}</td>
                  <td style={{ padding: "8px", color: "black" }}>{order.payment_method}</td>
                  <td style={{ padding: "8px", color: "black" }}>{order.status}</td>
                  <td style={{ padding: "8px", color: "black" }}>
                    <button onClick={() => handleCancelOrder(index)}>Cancel</button>
                    <button onClick={() => handleEditOrder(index)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddMenuForm;