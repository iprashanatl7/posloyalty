import { useState } from "react";
import { useCallback } from "react";
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Heading,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../hooks";
import { addcustomertocart } from "../utils/addcustomertocart";
import { accesscartapi } from "../utils/accesscartapi";

const NewCustomer = () => {
  const [inputFirstNameData, setInputFirstName] = useState({
    inputField: "",
    errorMessage: "",
  });
  const [inputLastNameData, setInputLastName] = useState({
    inputField: "",
    errorMessage: "",
  });
  const [inputEmailData, setInputEmail] = useState({
    inputField: "",
    errorMessage: "",
  });
  const [inputPhoneData, setInputPhone] = useState({
    inputField: "",
    errorMessage: "",
  });
  const fetch = useAuthenticatedFetch();

  const customerData = {
    firstName: inputFirstNameData?.inputField,
    lastName: inputLastNameData?.inputField,
    email: inputEmailData?.inputField,
    phone: inputPhoneData?.inputField,
  };

  const inputchangeHandler = useCallback((value, id) => {
    console.log("input received", value, id);
    switch (id) {
      case "firstname":
        console.log("first received", value, id);
        setInputFirstName((prevValue) => {
          return { ...prevValue, inputField: value };
        });
        break;
      case "lastname":
        console.log("last received", value, id);
        setInputLastName((prevValue) => {
          return { ...prevValue, inputField: value };
        });
        break;
      case "phone":
        console.log("phone received", value, id);
        setInputPhone((prevValue) => {
          return { ...prevValue, inputField: value };
        });
        break;
      case "email":
        console.log("email received", value, id);
        setInputEmail((prevValue) => {
          return { ...prevValue, inputField: value };
        });
        break;
      default:
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("form submitted");
    console.log({ customerData });
    const response = await fetch("/api/customer/create", {
      method: "POST",
      body: JSON.stringify(customerData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log({ result }, result.payload);

    if (response.ok) {
      console.log("customer added successfully");
      addcustomertocart(result.payload);
    } else {
      console.log("error creating customer");
    }

    // accesscartapi();
    // console.log("fetch cart details");
    // fetch(window.Shopify.routes.root + "cart.js")
    //   .then((res) => res.json())
    //   .then((data) => console.log(data));
  };

  return (
    <Card sectioned>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <TextField
            label="First Name"
            id="firstname"
            value={inputFirstNameData?.inputField}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            label="Last Name"
            id="lastname"
            value={inputLastNameData?.inputField}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            type="email"
            id="email"
            value={inputEmailData?.inputField}
            label="Email Address"
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            label="Loyalty Phone number"
            id="phone"
            type="tel"
            value={inputPhoneData?.inputField}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <Button fullWidth submit>
            Submit
          </Button>
        </FormLayout>
      </Form>
    </Card>
  );
};

export default NewCustomer;
