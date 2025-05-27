// In your workOrders query, ensure you return an empty array if no data
const { data: workOrders = [] } = useQuery({
    queryKey: ["workOrders", workorder.work_order_rc_factory_no],
    queryFn: async () => {
      if (!workorder.work_order_rc_factory_no) return [];
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/fetch-work-order/${workorder.work_order_rc_factory_no}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch work orders");
      const data = await response.json();
      return data.workorder || []; // Ensure this matches your API response structure
    },
    enabled: !!workorder.work_order_rc_factory_no,
  });
  
  // In your Select component for Work Order ID:
  <Select
    name="work_order_rc_id"
    value={workorder.work_order_rc_id}
    onValueChange={(value) => {
      const selectedWorkOrder = workOrders.find((item) => item.work_order_no.toString() === value);
      setWorkorder({
        ...workorder,
        work_order_rc_id: selectedWorkOrder?.work_order_no,
        work_order_no: selectedWorkOrder?.work_order_no,
      });
    }}
    disabled={!workorder.work_order_rc_factory_no}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select work order" />
    </SelectTrigger>
    <SelectContent>
      {workOrders.map((workOrder) => (
        <SelectItem
          key={workOrder.id}
          value={workOrder.work_order_no.toString()}
        >
          {workOrder.work_order_no}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>


const { data: brandData } = useQuery({
    queryKey: ["brand", workorder.work_order_rc_id],
    queryFn: async () => {
      if (!workorder.work_order_rc_id) return { workorderbrand: { work_order_brand: "" } };
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/fetch-work-order-brand/${workorder.work_order_rc_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch brand");
      const data = await response.json();
      return data || { workorderbrand: { work_order_brand: "" } };
    },
    enabled: !!workorder.work_order_rc_id,
  });