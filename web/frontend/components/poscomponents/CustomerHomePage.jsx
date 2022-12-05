import { useNavigate } from "@shopify/app-bridge-react";
import { Card, TextField, Icon, Button } from "@shopify/polaris";
import { MobileBackArrowMajor } from "@shopify/polaris-icons";
import { useState } from "react";
import "./CustomerHomePage.css";
import SearchCustomer from "./SearchCustomer";

const CustomerHomePage = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const searchInputChangeHandler = (value, id) => {
    console.log("search entered");
    setSearchInput(value);
  };

  return (
    <Card sectioned>
      <Card sectioned>
        <div className="search-bar">
          <span>
            <Button onClick={() => navigate("")}>
              <Icon source={MobileBackArrowMajor} color="base" />
            </Button>
          </span>
          <div>
            <TextField
              id="searchField"
              value={searchInput}
              onChange={(value, id) => searchInputChangeHandler(value, id)}
              autoComplete="off"
              placeholder="Search Email Phone Name"
            />
          </div>
        </div>
      </Card>
      <Button fullWidth onClick={() => navigate("/addcustomer")}>
        Add customer
      </Button>
      <Card sectioned>
        <SearchCustomer />
      </Card>
    </Card>
  );
};

export default CustomerHomePage;
