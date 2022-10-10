import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import styled from "styled-components";

import InvoiceEdit from "./GenerateInvoiceModal";
import { saveInvoicesDetailsToStore } from "../../redux/actions/Actions";
import {
  toastSuccessNotification,
  toastErrorNotification,
} from "../../constants";
import InvoiceReadTable from "./InvoiceReadTable";

const Container = styled.div`
  width: 100%;
  border-left: 1.5px solid black;
  border-right: 1.5px solid black;
  font-family: arial;
  height: 100vh;
`;
const Header = styled.div`
  display: flex;
  background-color: #d4ac0d;
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
    background-color: #a93226;
    border: none;
    padding: 5px 10px;
    display: inline-block;
    color: #fff;
  }
  button:hover {
    background-color: #922b21;
  }
`;

const Invoices = ({
  invoicesDetails,
  customersDetails,
  productsDetails,
  saveInvoicesDetailsToStore,
  handleDataLoad
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isInvoicesRecordsUpdated, setInvoicesRecordsUpdated] = useState(false);
  const [label, setLabel] = useState("Add");

  useEffect(() => {
    axios
      .get("https://shivomcrudapi.herokuapp.com/invoices")
      .then((response) => {
        saveInvoicesDetailsToStore(response.data);
        handleDataLoad(true, "invoice");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "invoice");
      });
    setInvoicesRecordsUpdated(false);
  }, [isInvoicesRecordsUpdated, isEditing]);

  const handleInvoiceDelete = (invoiceNumber) => {
    handleDataLoad(false, "invoice");
    axios({
      method: "delete",
      url: "https://shivomcrudapi.herokuapp.com/invoices/" + invoiceNumber,
    })
      .then(() => {
        setInvoicesRecordsUpdated(true);
        toastSuccessNotification("invoice deleted successfully");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "invoice");
      });
  };

  return (
    <>
      <Container>
        <Header>
          <h3>Manage Invoices</h3>
          <div>
            <button
              onClick={() => {
                setIsEditing(true);
                setLabel("Add");
              }}
            >
              Generate invoice
            </button>
          </div>
        </Header>
        <InvoiceReadTable
          allInvoices={invoicesDetails}
          handleInvoiceDelete={handleInvoiceDelete}
          handleDataLoad={handleDataLoad}
        />
        <InvoiceEdit
          handlePopUpClose={() => setIsEditing(false)}
          isEditing={isEditing}
          label={label}
          customersDetails={customersDetails}
          productsDetails={productsDetails}
          handleDataLoad={handleDataLoad}
        />
      </Container>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    invoicesDetails: state.invoiceReducer,
    customersDetails: state.customerReducer,
    productsDetails: state.productsReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveInvoicesDetailsToStore: (data) => {
      dispatch(saveInvoicesDetailsToStore(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Invoices);
