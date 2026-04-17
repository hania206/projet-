import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, CheckCircle, AlertTriangle } from "lucide-react";

export default function Notifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token;

  const API = "http://localhost:5000/api/notifications";

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Notification error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${API}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="text-red-500" />;
      case "success":
        return <CheckCircle className="text-green-500" />;
      default:
        return <Bell className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-emerald-600">
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        🔔 Notifications
      </h1>

      {data.length === 0 ? (
        <p className="text-gray-400">Aucune notification</p>
      ) : (
        data.map((n) => (
          <div
            key={n._id}
            className={`p-4 mb-4 rounded-xl shadow flex justify-between items-center transition ${
              n.read ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div className="flex gap-3 items-center">
              {getIcon(n.type)}
              <span>{n.message}</span>
            </div>

            {!n.read && (
              <button
                onClick={() => markAsRead(n._id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}