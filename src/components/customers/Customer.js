import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import styled from "styled-components";

import CustomerRead from "./CustomerRead";
import CustomerEdit from "./CustomerEdit";
import { saveCustomersDetailsToStore } from "../../redux/actions/Actions";
import {
  toastSuccessNotification,
  toastErrorNotification,
} from "../../constants";
import Spinner from "../shared/Spinner";

const Contianer = styled.div`
  width: 100%;
  font-family: arial;
`;
const Header = styled.div`
  display: flex;
  background-color: #f1948a;
  padding: 15px 5px;
  h3 {
    width: 60%;
    margin: 0;
    color: #fff;
  }
  div {
    width: 40%;
    text-align: right;
  }
  button {
    background-color: #1abc9c;
    border: none;
    padding: 5px 10px;
    display: inline-block;
    color: #fff;
  }
  button:hover {
    background-color: #17a589;
  }
`;

const Customer = ({
  customersData,
  saveCustomersDetailsToStore,
  handleDataLoad,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomerRecordsUpdated, setCustomerRecordsUpdated] = useState(false);
  const [initialValues, setInitialValues] = useState();
  const [label, setLabel] = useState("Add");

  useEffect(() => {
    axios
      .get("https://shivomcrudapi.herokuapp.com/customers")
      .then((response) => {
        saveCustomersDetailsToStore(response.data);
        handleDataLoad(true, "customer");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "customer");
      });
    setCustomerRecordsUpdated(false);
  }, [isCustomerRecordsUpdated, initialValues]);

  const handleSubmit = (values, action) => {
    handleDataLoad(false, "customer");
    switch (action) {
      case "Add":
        axios({
          method: "post",
          url: "https://shivomcrudapi.herokuapp.com/customers/",
          data: {
            loginID: values.loginID,
            customerName: values.customerName,
            phone: values.phone,
          },
        })
          .then((response) => {
            if (response.data === "existing") {
              alert("LoginID already exists");
              handleDataLoad(true, "customer");
            } else {
              setCustomerRecordsUpdated(true);
              setIsEditing(false);
              toastSuccessNotification("new cutomer added successfully");
            }
          })
          .catch((error) => {
            toastErrorNotification(error.message);
            setIsEditing(true);
            handleDataLoad(true, "customer");
          });
        break;
      case "Update":
        axios({
          method: "put",
          url:
            "https://shivomcrudapi.herokuapp.com/customers/" + values.loginID,
          data: {
            customerName: values.customerName,
            phone: values.phone,
          },
        })
          .then(() => {
            setCustomerRecordsUpdated(true);
            setIsEditing(false);
            toastSuccessNotification("customer data updated successfully");
          })
          .catch((error) => {
            toastErrorNotification(error.message);
            setIsEditing(true);
            handleDataLoad(true, "customer");
          });
        break;
      default:
    }
  };

  const handleCustomerDelete = (customerLoginId) => {
    handleDataLoad(false, "customer");
    axios({
      method: "delete",
      url: "https://shivomcrudapi.herokuapp.com/customers/" + customerLoginId,
    })
      .then(() => {
        setCustomerRecordsUpdated(true);
        toastSuccessNotification("customer data deleted successfully");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "customer");
      });
  };

  const handleCustomerEdit = (customerLoginId) => {
    if (customersData.length > 0) {
      const customer = customersData.filter((customer) => {
        return customer.loginID === customerLoginId;
      });
      setInitialValues({
        loginID: customer[0].loginID,
        customerName: customer[0].customerName,
        phone: customer[0].phone,
      });
      setIsEditing(true);
      setLabel("Update");
    }
  };

  return (
    <Contianer>
      <Header>
        <h3>Manage Customers</h3>
        <div>
          <button
            onClick={() => {
              setIsEditing(true);
              setInitialValues({
                loginID: "",
                customerName: "",
                phone: "",
              });
              setLabel("Add");
            }}
          >
            Add new customer
          </button>
        </div>
      </Header>
      <CustomerRead
        customers={customersData}
        editCustomerDetails={(customerLoginId) =>
          handleCustomerEdit(customerLoginId)
        }
        handleCustomerDelete={handleCustomerDelete}
      />
      <CustomerEdit
        handleFormClose={() => setIsEditing(false)}
        isEditing={isEditing}
        handleSubmit={handleSubmit}
        initialValues={initialValues}
        label={label}
      />
    </Contianer>
  );
};

const mapStateToProps = (state) => {
  return {
    customersData: state.customerReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveCustomersDetailsToStore: (data) => {
      dispatch(saveCustomersDetailsToStore(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Customer);
