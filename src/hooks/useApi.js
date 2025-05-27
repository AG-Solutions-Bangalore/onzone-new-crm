
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BASE_URL from "@/config/BaseUrl";

const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

const fetchData = async (endpoint, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);
  return response.json();
};

const createQueryConfig = (queryKey, endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  return {
    queryKey,
    queryFn: () => fetchData(endpoint, token),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: 2,
    ...options,
  };
};

export const useFetchBuyers = () => {
  return useQuery(createQueryConfig(["buyer"], "/api/panel-fetch-buyer"));
};

export const useFetchCompanys = () => {
  return useQuery(createQueryConfig(["branch"], "/api/panel-fetch-branch"));
};
export const useFetchProduct = () => {
  return useQuery(createQueryConfig(["product"], "/api/panel-fetch-product"));
};

export const useFetchContractNos = (company_sort) => {
  const queryClient = useQueryClient();

  const query = useQuery(
    createQueryConfig(
      ["contractnoss", company_sort],
      `/api/panel-fetch-contract-no/${company_sort}`,
      {
        enabled: Boolean(company_sort),
      }
    )
  );

  const prefetchNextContractNos = async () => {
    if (company_sort) {
      await queryClient.prefetchQuery(
        createQueryConfig(
          ["contractnoss", company_sort],
          `/api/panel-fetch-contract-no/${company_sort}`
        )
      );
    }
  };

  return { ...query, prefetchNextContractNos };
};
export const useFetchProductNos = (company_sort) => {
  const queryClient = useQueryClient();

  const query = useQuery(
    createQueryConfig(
      ["productnoss", company_sort],
      `/api/panel-fetch-purchase-product-no/${company_sort}`,
      {
        enabled: Boolean(company_sort),
      }
    )
  );

  const prefetchNextProductNos = async () => {
    if (company_sort) {
      await queryClient.prefetchQuery(
        createQueryConfig(
          ["productnoss", company_sort],
          `/api/panel-fetch-purchase-product-no/${company_sort}`
        )
      );
    }
  };

  return { ...query, prefetchNextProductNos };
};

export const useFetchPortofLoadings = () => {
  return useQuery(
    createQueryConfig(["portofLoadings"], "/api/panel-fetch-portofLoading")
  );
};

export const useFetchContainerSizes = () => {
  return useQuery(
    createQueryConfig(["containersizes"], "/api/panel-fetch-container-size")
  );
};

export const useFetchPaymentTerms = () => {
  return useQuery(
    createQueryConfig(["paymentTerms"], "/api/panel-fetch-paymentTermsC")
  );
};

export const useFetchPorts = () => {
  return useQuery(
    createQueryConfig(["ports"], "/api/panel-fetch-country-port")
  );
};

export const useFetchCountrys = () => {
  return useQuery(createQueryConfig(["country"], "/api/panel-fetch-country"));
};

export const useFetchMarkings = () => {
  return useQuery(createQueryConfig(["markings"], "/api/panel-fetch-marking"));
};

export const useFetchItemNames = () => {
  return useQuery(
    createQueryConfig(["itemNames"], "/api/panel-fetch-itemname")
  );
};
export const useFetchState = () => {
  return useQuery(createQueryConfig(["state"], "/api/panel-fetch-state"));
};
export const useFetchPreReceipt = () => {
  return useQuery(
    createQueryConfig(["preReceipt"], "/api/panel-fetch-prereceipts")
  );
};
export const useFetchScheme = () => {
  return useQuery(createQueryConfig(["scheme"], "/api/panel-fetch-scheme"));
};

export const useFetchDescriptionofGoods = () => {
  return useQuery(
    createQueryConfig(
      ["descriptionofGoodss"],
      "/api/panel-fetch-descriptionofGoods"
    )
  );
};

export const useFetchBagsTypes = () => {
  return useQuery(createQueryConfig(["bagTypes"], "/api/panel-fetch-bagType"));
};

//invoice apis

export const useFetchStatus = () => {
  return useQuery(
    createQueryConfig(["status"], "/api/panel-fetch-invoice-status")
  );
};
export const useFetchVessel = () => {
  return useQuery(createQueryConfig(["vessels"], "/api/panel-fetch-vessel"));
};
export const useFetchShipper = () => {
  return useQuery(createQueryConfig(["shippers"], "/api/panel-fetch-shipper"));
};

// payment edit invoice

export const useFetchPaymentAmount = () => {
  return useQuery(
    createQueryConfig(
      ["paymentamount"],
      "/api/panel-fetch-invoice-payment-amount"
    )
  );
};

//create Team

export const useFetchCompanies = () => {
  return useQuery(createQueryConfig(["companies"], "/api/panel-fetch-company"));
};
export const useFetchUserType = () => {
  return useQuery(
    createQueryConfig(["usertype"], "/api/panel-fetch-usertypes")
  );
};

// create purchase order

export const useFetchVendor = () => {
  return useQuery(createQueryConfig(["vendor"], "/api/panel-fetch-vendor"));
};

export const useFetchPurchaseProduct = () => {
  return useQuery(
    createQueryConfig(
      ["purchaseproduct"],
      "/api/panel-fetch-purchase-order-product"
    )
  );
};

//create markting order

export const useFetchGoDownMarketPurchase = () => {
  return useQuery(
    createQueryConfig(["godownmarket"], "/api/panel-fetch-godown")
  );
};

//  purchase dorpdown

export const useFetchGoDown = () => {
  return useQuery(createQueryConfig(["godown"], "/api/panel-fetch-godown"));
};
export const useFetchDispatchDcNo = () => {
  return useQuery(
    createQueryConfig(["dispatchDcNo"], "/api/panel-fetch-market-dispatch-dcno")
  );
};

// //product dropdown in costing
// export const useFetchProductCosting = (costing_product_id) => {
//   const queryClient = useQueryClient();

//   const query = useQuery(
//     createQueryConfig(
//       ["costing", costing_product_id],
//       `/api/panel-fetch-costing-default/${costing_product_id}`,
//       {
//         enabled: Boolean(costing_product_id),
//       }
//     )
//   );

//   const prefetchNextContractNos = async () => {
//     if (costing_product_id) {
//       await queryClient.prefetchQuery(
//         createQueryConfig(
//           ["costing", costing_product_id],
//           `/api/panel-fetch-costing-default/${costing_product_id}`
//         )
//       );
//     }
//   };

//   return { data: query.data ?? [], prefetchNextContractNos };
// };





// onzone hooks 


export const useFetchBrand = () => {
  return useQuery(createQueryConfig(["brand"], "/api/fetch-brand"));
};
export const useFetchWidth = () => {
  return useQuery(
    createQueryConfig(["width"], "/api/fetch-width")
  );
};
export const useFetchStyle = () => {
  return useQuery(
    createQueryConfig(["style"], "/api/fetch-style")
  );
};
export const useFetchRatio = () => {
  return useQuery(
    createQueryConfig(["ratio"], "/api/fetch-ratio")
  );
};
export const useFetchHalfRatio = () => {
  return useQuery(
    createQueryConfig(["half_ratio"], "/api/fetch-half-ratio")
  );
};
export const useFetchFactory = () => {
  return useQuery(
    createQueryConfig(["factory"], "/api/fetch-factory")
  );
};
export const useFetchCurrentYear = () => {
  return useQuery(
    createQueryConfig(["current_year"], "/api/fetch-year")
  );
};
export const useFetchRetailer = () => {
  return useQuery(
    createQueryConfig(["retailers"], "/api/fetch-customer")
  );
};
