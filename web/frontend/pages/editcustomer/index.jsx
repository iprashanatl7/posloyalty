import { Card } from "@shopify/polaris";
import NewCustomer from "../../components/poscomponents/NewCustomer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthenticatedFetch } from "../../../../../ecomm-app/web/frontend/hooks";
import { useState } from "react";

const EditCustomerPage = () => {
  const { search } = useLocation();
  const [userData, setUserData] = useState({});

  console.log({ search });
  const custId = new URLSearchParams(search).get("customerId");
  console.log({ custId });
  const fetch = useAuthenticatedFetch();

  const fetchCustomeData = async () => {
    const url = `/api/customer/getdata?customerId=${custId}`;
    console.log({ url });

    const response = await fetch(url);
    const result = await response.json();
    console.log("fetch customer data:", result);
    if (response.ok) {
      console.log("customer get successfully");
      setUserData(result);
    } else {
      console.log("error pulling customer");
    }
  };

  useEffect(() => {
    fetchCustomeData();
  }, []);

  return (
    <Card sectioned>
      <NewCustomer existingUser={userData.payload} />
    </Card>
  );
};

export default EditCustomerPage;
