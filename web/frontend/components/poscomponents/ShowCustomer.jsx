const ShowCustomer = ({ user }) => {
  return (
    <h1>
      Customer
      {`${user?.id} ${user?.first_name} ${user?.last_name} ${user?.phone}`}
    </h1>
  );
};

export default ShowCustomer;
