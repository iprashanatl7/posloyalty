import { useNavigate } from "@shopify/app-bridge-react";
import { Card, Button, Icon } from "@shopify/polaris";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthenticatedFetch } from "../../../../../ecomm-app/web/frontend/hooks";
import ShowCustomer from "./ShowCustomer";
import { CircleInformationMajor } from "@shopify/polaris-icons";

const CUSTOMERS = [
  {
    id: 6704005579070,
    email: "one1@gmail.com",
    first_name: "Mannos",
    last_name: "JJJasd",
    phone: "+4567655678",
    marketing_opt_in_level: null,
    email_marketing_consent: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
    },
    loyalty_opt_in: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
      points: "OTHER",
    },
  },
  {
    id: 6704006431038,
    email: "one@gmail.com",
    first_name: "Mannos",
    last_name: "JJJasd",
    phone: "+1231234123",
    marketing_opt_in_level: null,
    email_marketing_consent: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
    },
    loyalty_opt_in: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
      points: "OTHER",
    },
  },
  {
    id: 6703402451262,
    email: "ten10@gmail.com",
    first_name: "Tenli",
    last_name: "TenLe",
    phone: "+19870987190",
    marketing_opt_in_level: null,
    email_marketing_consent: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
    },
    loyalty_opt_in: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
      points: "OTHER",
    },
  },
];

const SearchCustomer = ({ searchInput }) => {
  console.log("searchcustomer called", searchInput);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  useEffect(() => {
    fetchCustomerData();
  }, [searchInput]);

  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`/api/customer/search/:${searchInput}`);
      const result = await response.json();
      console.log(result);
      setSearchResults(result.payload.customers || []);
      setIsLoading(false);
    } catch (e) {}
  };

  console.log(searchResults);
  return (
    <>
      {isLoading && <div>Loading...</div>}
      {searchResults.length > 0 &&
        searchResults.map((user) => {
          return (
            <li
              key={user.id}
              style={{ listStyle: "none", marginBottom: "1px" }}
            >
              <Link to={`/editcustomer/?customerId=${user.id}`}>
                <Card>
                  <ShowCustomer user={user} />
                </Card>
              </Link>
            </li>
          );
        })}
      {!isLoading && searchResults.length === 0 && (
        <div>
          <Icon source={CircleInformationMajor} color="base" />{" "}
          <h5>No Results</h5>
          <p>
            No results found for 'tug' . Enter a new search term or create a
            customer
          </p>
        </div>
      )}
    </>
  );
};

export default SearchCustomer;
