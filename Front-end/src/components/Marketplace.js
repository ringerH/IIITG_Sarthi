import { useState } from "react";

function Marketplace() {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [itemData, setItemData] = useState({
    title: "",
    price: "",
    desc: "",
  });

  const handleChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setItems([...items, itemData]);
    setItemData({ title: "", price: "", desc: "" });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No items listed yet. Click “Add Item” to post something.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="font-semibold text-lg">{it.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {it.desc}
                </p>
                <p className="text-blue-600 font-medium mt-2">₹{it.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  placeholder="Item Title"
                  value={itemData.title}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price (₹)"
                  value={itemData.price}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <textarea
                  name="desc"
                  placeholder="Description"
                  value={itemData.desc}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 resize-none"
                ></textarea>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
