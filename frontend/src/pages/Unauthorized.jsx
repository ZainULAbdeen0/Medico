const Unauthorized = () => {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-gray-600">You do not have permission to view this page.</p>
    </section>
  );
};

export default Unauthorized;