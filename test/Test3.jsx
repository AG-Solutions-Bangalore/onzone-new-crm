import React, { useState } from "react";
import Layout from "../../../layout/Layout";
import MasterFilter from "../../../components/MasterFilter";
import BASE_URL from "../../../base/BaseUrl";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, Input } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdSend } from "react-icons/md";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

const retailer_type = [
  {
    value: "Agent",
    label: "Agent",
  },
  {
    value: "Wholesale",
    label: "Wholesale",
  },
  {
    value: "Distributor",
    label: "Distributor",
  },
  {
    value: "Retailers",
    label: "Retailers",
  },
];

const AddRetailer = () => {
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [customer, setCustomer] = useState({
    customer_name: "",
    customer_type: "",
    customer_mobile: "",
    customer_email: "",
    customer_address: "",
  });

  const validateOnlyDigits = (inputtxt) => {
    var phoneno = /^\d+$/;
    return inputtxt.match(phoneno) || inputtxt.length === 0;
  };

  const validateOnlyText = (inputtxt) => {
    var re = /^[A-Za-z ]+$/;
    return inputtxt === "" || re.test(inputtxt);
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "customer_mobile") {
      if (validateOnlyDigits(value)) {
        setCustomer({
          ...customer,
          [name]: value,
        });
      }
    } else if (name === "customer_name") {
      if (validateOnlyText(value)) {
        setCustomer({
          ...customer,
          [name]: value,
        });
      }
    } else {
      setCustomer({
        ...customer,
        [name]: value,
      });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setIsButtonDisabled(true);

    let data = {
      customer_name: customer.customer_name,
      customer_type: customer.customer_type,
      customer_mobile: customer.customer_mobile,
      customer_email: customer.customer_email,
      customer_address: customer.customer_address,
    };

    axios({
      url: BASE_URL + "/api/create-customer",
      method: "POST",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (res.data.code == "200") {
          toast.success("Retailer Created Successfully");

          
          setCustomer({
            customer_name: "",
            customer_type: "",
            customer_mobile: "",
            customer_email: "",
            customer_address: "",
          });

          navigate("/retailer");
        } else {
          toast.error("Duplicate Entry");
        }
        setIsButtonDisabled(false);
      })
      .catch((error) => {
        toast.error("Error Creating Retailer");
        setIsButtonDisabled(false);
      });
  };
  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Create Retailer
        </h3>
      </div>
      <div className="w-full mt-5 p-4 bg-white shadow-lg rounded-xl">
        <form id="addIndiv" autoComplete="off" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <div className="form-group">
              <Input
                label="Retailer Name"
                type="text"
                name="customer_name"
                value={customer.customer_name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel id="service-select-label">
                  <span className="text-sm relative bottom-[6px]">
                    Type <span className="text-red-700">*</span>
                  </span>
                </InputLabel>
                <Select
                  sx={{ height: "40px", borderRadius: "5px" }}
                  labelId="service-select-label"
                  id="service-select"
                  name="customer_type"
                  value={customer.customer_type}
                  onChange={onInputChange}
                  label="Type *"
                  required
                >
                  {retailer_type.map((type) => (
                    <MenuItem key={type.value} value={String(type.value)}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="form-group">
              <Input
                label="Mobile Number"
                type="text"
                name="customer_mobile"
                maxLength={10}
                minLength={10}
                value={customer.customer_mobile}
                onChange={onInputChange}
  
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="form-group">
              <Input
                label="Email"
                type="email"
                name="customer_email"
                value={customer.customer_email}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="form-group">
              <Input
                label="Address"
                type="text"
                name="customer_address"
                value={customer.customer_address}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="submit"
              className="mr-2 mb-2"
              disabled={isButtonDisabled}
            >
              <div className="flex gap-1">
                <MdSend className="w-4 h-4" />
                <span>{isButtonDisabled ? "Submitting..." : "Submit"}</span>
              </div>
            </Button>

            <Link to="/retailer">
              <Button className="mr-2 mb-2">
                <div className="flex gap-1">
                  <MdArrowBack className="w-5 h-5" />
                  <span>Back</span>
                </div>
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddRetailer;