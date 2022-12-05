import { useState } from "react";
import { useCallback } from "react";
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Checkbox,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../hooks";
import { addcustomertocart } from "../utils/addcustomertocart";
import "./NewCustomer.css";
import { useNavigate } from "@shopify/app-bridge-react";
import { useEffect } from "react";

const NewCustomer = ({ existingUser }) => {
  console.log(existingUser);
  console.log(existingUser?.firstName);
  const [inputFirstNameData, setInputFirstName] = useState({
    inputField: existingUser?.firstName || "",
    errorMessage: "",
  });
  const [inputLastNameData, setInputLastName] = useState({
    inputField: existingUser?.lastName || "",
    errorMessage: "",
  });
  const [inputEmailData, setInputEmail] = useState({
    inputField: existingUser?.email || "",
    errorMessage: "",
  });
  const [inputPhoneData, setInputPhone] = useState({
    inputField: existingUser?.phone || "",
    errorMessage: "",
  });
  const [isAloAccessCheckedIn, setIsAloAccessCheckedIn] = useState(false);
  const [isMarketingEmailsChecked, setIsMarketingEmailsChecked] =
    useState(false);

  const [isInputValid, setIsinputValid] = useState("false");
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const customerData = {
    firstName: inputFirstNameData?.inputField,
    lastName: inputLastNameData?.inputField,
    email: inputEmailData?.inputField,
    phone: inputPhoneData?.inputField,
  };
  console.log({ customerData });
  useEffect(() => {
    setInputFirstName((prevValue) => {
      return { ...prevValue, inputField: existingUser?.firstName || "" };
    });
    setInputLastName((prevValue) => {
      return { ...prevValue, inputField: existingUser?.lastName || "" };
    });
    setInputEmail((prevValue) => {
      return { ...prevValue, inputField: existingUser?.email || "" };
    });
    setInputPhone((prevValue) => {
      return { ...prevValue, inputField: existingUser?.phone || "" };
    });
  }, [existingUser]);

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

    // validateInputs();

    console.log("form submitted");
    console.log({ customerData });
    let response = null;
    if (existingUser) {
      response = await fetch(
        `/api/customer/edit?customerId=${existingUser.id}`,
        {
          method: "POST",
          body: JSON.stringify(customerData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      response = await fetch("/api/customer/create", {
        method: "POST",
        body: JSON.stringify(customerData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

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

  const validateInputs = () => {
    let errors = 0;
    const nameRegex = /^[A-Za-z]{2,30}$/;
    if (!inputFirstNameData["inputField"].match(nameRegex)) {
      errors++;
      setInputFirstName((prevValue) => ({
        ...prevValue,
        errorMessage: "Please enter valid first name with atleast 2 characters",
      }));
    } else {
      setInputFirstName((prevValue) => ({
        ...prevValue,
        errorMessage: "",
      }));
    }

    if (!inputLastNameData["inputField"].match(nameRegex)) {
      errors++;
      setInputLastName((prevValue) => ({
        ...prevValue,
        errorMessage: "Please enter valid last name with atleast 2 characters",
      }));
    } else {
      setInputLastName((prevValue) => ({
        ...prevValue,
        errorMessage: "",
      }));
    }

    if (
      inputEmailData.inputField.trim().length > 0 ||
      inputPhoneData.inputField.trim().length > 0
    ) {
      if (inputEmailData.inputField.trim().length > 0) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailData["inputField"].match(emailRegex)) {
          errors++;
          setInputEmail((prevValue) => ({
            ...prevValue,
            errorMessage: "Please enter valid email address",
          }));
        } else {
          setInputEmail((prevValue) => ({
            ...prevValue,
            errorMessage: "",
          }));
        }
      } else {
        setInputEmail((prevValue) => ({
          inputField: `${inputPhoneData.inputField}@aloyoga.com`,
          errorMessage: "",
        }));
      }
    }

    if (inputPhoneData.inputField.trim().length > 0) {
      const phoneRegex =
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
      if (!inputPhoneData["inputField"].match(phoneRegex)) {
        errors++;
        setInputPhone((prevValue) => ({
          ...prevValue,
          errorMessage: "Please enter valid phone address",
        }));
      }
    } else {
      setInputPhone((prevValue) => ({
        inputField: `+16139991234`,
        errorMessage: "",
      }));
    }
  };

  const handleAloAccessChange = () => {
    setIsAloAccessCheckedIn((prevValue) => !prevValue);
  };

  const handleMarketingEmailChange = () => {
    setIsMarketingEmailsChecked((prevValue) => !prevValue);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <Card sectioned>
      <div className="top-actions">
        <Button onClick={() => navigate("/")}>Cancel</Button>
        <Button onClick={handleSubmit}>Save & Add to Cart</Button>
      </div>
      <Form>
        <FormLayout>
          <TextField
            label="First Name"
            id="firstname"
            value={inputFirstNameData?.inputField}
            error={inputFirstNameData?.errorMessage}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            label="Last Name"
            id="lastname"
            error={inputLastNameData?.errorMessage}
            value={inputLastNameData?.inputField}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            type="email"
            id="email"
            error={inputEmailData?.errorMessage}
            value={inputEmailData?.inputField}
            label="Email Address"
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <TextField
            label="Phone number"
            id="phone"
            type="tel"
            error={inputPhoneData?.errorMessage}
            value={inputPhoneData?.inputField}
            onChange={(value, id) => inputchangeHandler(value, id)}
          />
          <div className="check-box-options">
            <Checkbox
              label="Alo Access Opt In?"
              checked={isAloAccessCheckedIn}
              onChange={handleAloAccessChange}
            />
            <Checkbox
              label="Marketing Emails?"
              checked={isMarketingEmailsChecked}
              onChange={handleMarketingEmailChange}
            />
          </div>
        </FormLayout>
      </Form>
    </Card>
  );
};

export default NewCustomer;
