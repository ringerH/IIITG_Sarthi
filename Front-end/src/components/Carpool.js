import { useState } from "react";

function Carpool() {
  const [showModal, setShowModal] = useState(false);
  const [rides, setRides] = useState([]);
  const [rideData, setRideData] = useState({
    name: "",
    from: "",
    to: "",
    time: "",
    price: "",
  });

  const handleChange = (e) => {
    setRideData({ ...rideData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setRides([...rides, rideData]);
    setRideData({ name: "", from: "", to: "", time: "", price: "" });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Carpool</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Post Ride
          </button>
        </div>

        {rides.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No rides posted yet. Click “Post Ride” to add one.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rides.map((r, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="font-semibold text-lg">{r.name}</h2>
                <p className="text-sm mt-1">
                  {r.from} ➜ {r.to}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time: {r.time}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  ₹{r.price}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">Post a Ride</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={rideData.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="text"
                  name="from"
                  placeholder="From"
                  value={rideData.from}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="text"
                  name="to"
                  placeholder="To"
                  value={rideData.to}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="text"
                  name="time"
                  placeholder="Time"
                  value={rideData.time}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price (₹)"
                  value={rideData.price}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  required
                />

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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Post
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

export default Carpool;
