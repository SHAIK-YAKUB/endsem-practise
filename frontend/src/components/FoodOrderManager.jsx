import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FoodOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState({
    id: '',
    foodName: '',
    foodType: '',
    price: 0,
    quantity: 1,
    totalCost: 0,
    customerName: '',
    contact: '',
    address: ''
  });
  const [idToFetch, setIdToFetch] = useState('');
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const baseUrl = `${import.meta.env.VITE_API_URL}/foodapi`;

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Auto calculate total cost
  useEffect(() => {
    setOrder(prev => ({ ...prev, totalCost: prev.price * prev.quantity }));
  }, [order.price, order.quantity]);

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get(`${baseUrl}/all`);
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch orders.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: name === 'price' || name === 'quantity' ? Number(value) : value }));
  };

  const validateForm = () => {
    for (let key in order) {
      if (order[key] === '' || order[key] === null) {
        setMessage(`Please fill out ${key}`);
        return false;
      }
    }
    return true;
  };

  const addOrder = async () => {
    if (!validateForm()) return;
    try {
      await axios.post(`${baseUrl}/add`, order);
      setMessage('Order added successfully.');
      fetchAllOrders();
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || 'Error adding order.');
    }
  };

  const updateOrder = async () => {
    if (!validateForm()) return;
    try {
      await axios.put(`${baseUrl}/update`, order);
      setMessage('Order updated successfully.');
      fetchAllOrders();
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || 'Error updating order.');
    }
  };

  const deleteOrder = async (id) => {
    try {
      const res = await axios.delete(`${baseUrl}/delete/${id}`);
      setMessage(res.data);
      fetchAllOrders();
    } catch (error) {
      console.error(error);
      setMessage('Error deleting order.');
    }
  };

  const getOrderById = async () => {
    try {
      const res = await axios.get(`${baseUrl}/get/${idToFetch}`);
      setFetchedOrder(res.data);
      setMessage('');
    } catch (error) {
      setFetchedOrder(null);
      setMessage('Order not found.');
    }
  };

  const handleEdit = (o) => {
    setOrder(o);
    setEditMode(true);
    setMessage(`Editing order with ID ${o.id}`);
  };

  const resetForm = () => {
    setOrder({
      id: '',
      foodName: '',
      foodType: '',
      price: 0,
      quantity: 1,
      totalCost: 0,
      customerName: '',
      contact: '',
      address: ''
    });
    setEditMode(false);
  };

  // Dropdown options
  const foodNames = ['Pizza', 'Burger', 'Pasta', 'Salad', 'Sandwich'];
  const foodTypes = ['Veg', 'Non-Veg', 'Vegan', 'Gluten-Free'];
  const foodPrices = [100, 200, 300, 400, 500];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Restaurant Food Orders</h2>

      {message && <div style={message.toLowerCase().includes('error') ? styles.errorBanner : styles.successBanner}>{message}</div>}

      {/* Add/Edit Form */}
      <div style={styles.card}>
        <h3>{editMode ? 'Edit Order' : 'Add Order'}</h3>
        <div style={styles.formGrid}>
          <input style={styles.input} type="number" name="id" placeholder="ID" value={order.id} onChange={handleChange} />
          <select style={styles.select} name="foodName" value={order.foodName} onChange={handleChange}>
            <option value="">Select Food</option>
            {foodNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select style={styles.select} name="foodType" value={order.foodType} onChange={handleChange}>
            <option value="">Select Type</option>
            {foodTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={styles.select} name="price" value={order.price} onChange={handleChange}>
            <option value="">Select Price</option>
            {foodPrices.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input style={styles.input} type="number" name="quantity" placeholder="Quantity" value={order.quantity} onChange={handleChange} />
          <input style={styles.input} type="text" name="customerName" placeholder="Customer Name" value={order.customerName} onChange={handleChange} />
          <input style={styles.input} type="text" name="contact" placeholder="Contact" value={order.contact} onChange={handleChange} />
          <input style={styles.input} type="text" name="address" placeholder="Address" value={order.address} onChange={handleChange} />
          <input style={styles.input} type="number" name="totalCost" placeholder="Total Cost" value={order.totalCost} readOnly />
        </div>
        <div style={styles.btnGroup}>
          {!editMode ? (
            <button style={styles.btnBlue} onClick={addOrder}>Add Order</button>
          ) : (
            <>
              <button style={styles.btnGreen} onClick={updateOrder}>Update Order</button>
              <button style={styles.btnGray} onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Fetch by ID */}
      <div style={styles.card}>
        <h3>Get Order By ID</h3>
        <input style={styles.input} type="number" value={idToFetch} onChange={e => setIdToFetch(e.target.value)} placeholder="Enter ID" />
        <button style={styles.btnBlue} onClick={getOrderById}>Fetch</button>
        {fetchedOrder && (
          <pre style={styles.pre}>{JSON.stringify(fetchedOrder, null, 2)}</pre>
        )}
      </div>

      {/* All Orders Table */}
      <div style={styles.card}>
        <h3>All Orders</h3>
        {orders.length === 0 ? <p>No orders found.</p> : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {Object.keys(order).map(key => <th key={key} style={styles.th}>{key}</th>)}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    {Object.keys(order).map(key => <td key={key} style={styles.td}>{o[key]}</td>)}
                    <td style={styles.td}>
                      <button style={styles.btnGreen} onClick={() => handleEdit(o)}>Edit</button>
                      <button style={styles.btnRed} onClick={() => deleteOrder(o.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodOrderManager;

// ===== Inline Styles =====
const styles = {
  container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#2c3e50' },
  card: { backgroundColor: '#f9f9f9', padding: '20px', marginBottom: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '15px' },
  input: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' },
  select: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnBlue: { backgroundColor: '#3498db', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnGreen: { backgroundColor: '#2ecc71', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnGray: { backgroundColor: '#95a5a6', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnRed: { backgroundColor: '#e74c3c', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#3498db', color: 'white', textAlign: 'left' },
  td: { border: '1px solid #ddd', padding: '8px' },
  errorBanner: { backgroundColor: '#e74c3c', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '10px' },
  successBanner: { backgroundColor: '#2ecc71', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '10px' },
  pre: { backgroundColor: '#ecf0f1', padding: '10px', borderRadius: '5px', overflowX: 'auto' }
};
