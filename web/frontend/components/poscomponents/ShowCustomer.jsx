const ShowCustomer = ({ user }) => {
  console.log("showcustomer called");
  return (
    <h1>
      Customer
      {`${user?.id} ${user?.first_name} ${user?.last_name} ${user?.phone}`}
    </h1>
  );
};

export default ShowCustomer;
