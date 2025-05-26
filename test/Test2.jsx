here is my code "import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Option, Button } from "@material-tailwind/react";
import {
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import Layout from "../../../layout/Layout";
import BASE_URL from "../../../base/BaseUrl";
import { toast } from "react-toastify";

const work_receive = [
  {
    value: "Yes",
    label: "Yes",
  },
  {
    value: "No",
    label: "No",
  },
];

const EditOrderReceived = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workorder, setWorkOrderReceive] = useState({
    work_order_rc_factory_no: "",
    work_order_rc_id: "",
    work_order_rc_date: "",
    work_order_rc_dc_no: "",
    work_order_rc_dc_date: "",
    work_order_rc_brand: "",
    work_order_rc_box: "",
    work_order_rc_pcs: "",
    work_order_rc_fabric_received: "",
    work_order_rc_received_by: "",
    work_order_rc_fabric_count: "",
    work_order_rc_count: "",
    work_order_rc_remarks: "",
  });

  const useTemplate = {
    id: "",
    work_order_rc_sub_barcode: "",
    work_order_rc_sub_box: "",
  };
  const [users, setUsers] = useState([useTemplate]);

  const validateOnlyDigits = (inputtxt) => {
    const phoneno = /^\d+$/;
    return phoneno.test(inputtxt) || inputtxt.length === 0;
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "work_order_rc_box" || name === "work_order_rc_pcs") {
      if (validateOnlyDigits(value)) {
        setWorkOrderReceive((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setWorkOrderReceive((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onChange = (e, index) => {
    const { name, value } = e.target;
    setUsers((prev) =>
      prev.map((user, i) => (i === index ? { ...user, [name]: value } : user))
    );
  };

  useEffect(() => {
    const fetchEditReceived = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/fetch-work-order-received-by-id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWorkOrderReceive(response?.data?.workorderrc);
        setUsers(response?.data?.workorderrcsub);
      } catch (error) {
        console.error("Error fetching Factory data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditReceived();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      work_order_rc_dc_no: workorder.work_order_rc_dc_no,
      work_order_rc_dc_date: workorder.work_order_rc_dc_date,
      work_order_rc_box: workorder.work_order_rc_box,
      work_order_rc_pcs: workorder.work_order_rc_pcs,
      work_order_rc_fabric_received: workorder.work_order_rc_fabric_received,
      work_order_rc_fabric_count: workorder.work_order_rc_fabric_count,
      work_order_rc_remarks: workorder.work_order_rc_remarks,
      workorder_sub_rc_data: users,
      work_order_rc_count: workorder.work_order_rc_count,
    };
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/update-work-orders-received/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.code == "200") {
        toast.success("Work Order Receive Updated Successfully");
        navigate("/work-order-receive");
      } else {
        toast.error("error while  edit the order received");
      }
    } catch (error) {
      console.error("error getting onsumbit add order received".error);
      toast.error("APi Error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div>
        <div className="flex mb-4 flex-col md:flex-row justify-between items-center bg-white  p-2 rounded-lg space-y-4 md:space-y-0">
          <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
            Update Work Order Receive
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Factory"
                disabled
                name="work_order_rc_factory_no"
                value={workorder.work_order_rc_factory_no}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                label="Work Order ID"
                disabled
                name="work_order_rc_id"
                value={workorder.work_order_rc_id}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                type="date"
                disabled
                label="Receive Date"
                name="work_order_rc_date"
                value={workorder.work_order_rc_date}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                label="DC No"
                disabled
                name="work_order_rc_dc_no"
                value={workorder.work_order_rc_dc_no}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                type="date"
                label="DC Date"
                disabled
                name="work_order_rc_dc_date"
                value={workorder.work_order_rc_dc_date}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                label="Brand"
                disabled
                name="work_order_rc_brand"
                value={workorder.work_order_rc_brand}
                onChange={onInputChange}
                labelProps={{ className: "!text-gray-700" }}
              />

              <Input
                label="No of Box"
                required
                name="work_order_rc_box"
                value={workorder.work_order_rc_box}
                onChange={onInputChange}
              />

              <Input
                label="Total No of Pcs"
                name="work_order_rc_pcs"
                required
                value={workorder.work_order_rc_pcs}
                onChange={onInputChange}
              />

              <FormControl fullWidth>
                <InputLabel id="service-select-label">
                  <span className="text-sm relative bottom-[6px]">
                    Fabric Received <span className="text-red-700">*</span>
                  </span>
                </InputLabel>

                <MUISelect
                  required
                  sx={{ height: "40px", borderRadius: "5px" }}
                  labelId="service-select-label"
                  id="service-select"
                  label="Fabric Received"
                  name="work_order_rc_fabric_received"
                  value={workorder.work_order_rc_fabric_received}
                  onChange={onInputChange}
                >
                  {work_receive.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MUISelect>
              </FormControl>
              {workorder.work_order_rc_fabric_received == "Yes" && (
                <Input
                  label="Fabric Received By"
                  name="work_order_rc_received_by"
                  value={workorder.work_order_rc_received_by}
                  onChange={onInputChange}
                />
              )}
              <div
                className={`w-full  ${
                  workorder.work_order_rc_fabric_received === "Yes"
                    ? "lg:col-span-2"
                    : "lg:col-span-1"
                } `}
              >
                <Input
                  label="Fabric Left Over"
                  name="work_order_rc_fabric_count"
             
                  value={workorder.work_order_rc_fabric_count}
                  onChange={onInputChange}
                />
              </div>

              <div
                className={`w-full  ${
                  workorder.work_order_rc_fabric_received === "Yes"
                    ? "lg:col-span-4"
                    : "lg:col-span-2 "
                } `}
              >
                <Input
                  label="Remarks"
                  name="work_order_rc_remarks"
                  value={workorder.work_order_rc_remarks}
                  onChange={onInputChange}
                />
              </div>
            </div>

            <hr className="my-4" />

            {users.map((user, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <TextField
                  hidden
                  sx={{
                    display: "none",
                  }}
                  name="id"
                  value={user.id}
                  onChange={(e) => onChange(e, index)}
                />
                <Input
                  required
                  label="Box"
                  name="work_order_rc_sub_box"
                  value={user.work_order_rc_sub_box}
                  onChange={onInputChange}
                />
                <Input
                  label="T Code"
                  required
                  name="work_order_rc_sub_barcode"
                  value={user.work_order_rc_sub_barcode}
                  onChange={(e) => onChange(e, index)}
                />
              </div>
            ))}

            <div className="flex justify-center space-x-4 mt-6">
              <Button type="submit" color="blue">
                Update
              </Button>
              <Button
                color="green"
                onClick={() => navigate("/work-order-receive")}
              >
                Back
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditOrderReceived;" that i sisn normal materila-tailwind 






now i want to format this code and convert in to shadcn tanstack 



okay listen 

first 1:
convert al the fild into shadcn component to get the api use tanstack for api 


   
   third things try and catch wil be there 
   use only tanstack query 



   5th: i wnat compact a ggod looking layout and also make it inustry level format and give me full code 

   6th for toast  shadcn Toaster

   7th for icnon use lucid react icon
   8th other than shadcn  dont use anything


   

            last things i want make it compact sleek elgant a rich ui , and coompact means compact 
            
            and more imporntnat responsive and last thinsg make 

            11th: dont use useForm()

            12th: use zodimport * as z from "zod"; and responsive