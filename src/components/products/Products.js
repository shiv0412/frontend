import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import styled from "styled-components";

import ProductRead from "./ProductsRead";
import ProductEdit from "./ProductsEdit";
import { saveProductsDetailsToStore } from "../../redux/actions/Actions";
import {
  toastSuccessNotification,
  toastErrorNotification,
} from "../../constants";

const Contianer = styled.div`
  width: 100%;
  font-family: arial;
`;
const Header = styled.div`
  display: flex;
  background-color: #3498db;
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

const Products = ({
  productsData,
  saveProductsDetailsToStore,
  handleDataLoad,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProductsRecordsUpdated, setProductsRecordsUpdated] = useState(false);
  const [initialValues, setInitialValues] = useState();
  const [label, setLabel] = useState("Add");

  useEffect(() => {
    axios
      .get("https://shivomcrudapi.herokuapp.com/products")
      .then((response) => {
        saveProductsDetailsToStore(response.data);
        handleDataLoad(true, "product");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "product");
      });
    setProductsRecordsUpdated(false);
  }, [isProductsRecordsUpdated, initialValues]);

  const handleSubmit = (values, action) => {
    handleDataLoad(false, "product");
    switch (action) {
      case "Add":
        axios({
          method: "post",
          url: "https://shivomcrudapi.herokuapp.com/products",
          data: {
            productName: values.productName,
            unitPrice: values.unitPrice,
          },
        })
          .then((response) => {
            if (response.data === "existing") {
              alert("Product already exists");
              handleDataLoad(true, "product");
            } else {
              setProductsRecordsUpdated(true);
              setIsEditing(false);
              toastSuccessNotification("new product added successfully");
            }
          })
          .catch((error) => {
            toastErrorNotification(error.message);
            setIsEditing(true);
            handleDataLoad(true, "product");
          });
        break;
      case "Update":
        axios({
          method: "put",
          url:
            "https://shivomcrudapi.herokuapp.com/products/" +
            values.productName,
          data: {
            productName: values.productName,
            unitPrice: values.unitPrice,
          },
        })
          .then(() => {
            setProductsRecordsUpdated(true);
            setIsEditing(false);
            toastSuccessNotification("product data updated successfully");
          })
          .catch((error) => {
            toastErrorNotification(error.message);
            setIsEditing(true);
            handleDataLoad(true, "product");
          });
        break;
    }
  };

  const handleProductDelete = (productName) => {
    handleDataLoad(false, "product");
    axios({
      method: "delete",
      url: "https://shivomcrudapi.herokuapp.com/products/" + productName,
    })
      .then(() => {
        setProductsRecordsUpdated(true);
        toastSuccessNotification("product data deleted successfully");
      })
      .catch((error) => {
        toastErrorNotification(error.message);
        handleDataLoad(true, "product");
      });
  };

  const handleProductEdit = (productName) => {
    if (productsData.length > 0) {
      const product = productsData.filter((product) => {
        return product.productName === productName;
      });
      setInitialValues({
        productName: product[0].productName,
        unitPrice: product[0].unitPrice,
      });
      setIsEditing(true);
      setLabel("Update");
    }
  };

  return (
    <Contianer>
      <Header>
        <h3>Manage Products</h3>
        <div>
          <button
            onClick={() => {
              setIsEditing(true);
              setInitialValues({
                productName: "",
                unitPrice: "",
              });
              setLabel("Add");
            }}
          >
            Add new product
          </button>
        </div>
      </Header>
      <ProductRead
        products={productsData}
        editProductDetails={(productName) => handleProductEdit(productName)}
        handleProductDelete={handleProductDelete}
      />
      <ProductEdit
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
    productsData: state.productsReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveProductsDetailsToStore: (data) => {
      dispatch(saveProductsDetailsToStore(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
