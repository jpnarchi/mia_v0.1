const useApi = () => {
  const obtenerSessionCheckout = async (ID_CHECKOUT_SESSION) => {
    const response = await fetch(
      `${URL}${ROUTES.stripe}${ENDPOINTS.retrieve}?id_checkout=${ID_CHECKOUT_SESSION}`,
      {
        method: "GET",
        headers: headersApi,
      }
    );
    const json = await response.json();
    console.log(json);
  };

  const crearSessionCheckout = async (payment_data) => {
    const response = await fetch(`${URL}${ROUTES.stripe}${ENDPOINTS.create}`, {
      method: "POST",
      headers: headersApi,
      body: JSON.stringify({ payment_data }),
    });
    const json = await response.json();
    /* Aqui puedes agregar a la base de datos o asi */
    window.location.replace(json.url);
  };

  const obtenerClientes = async () => {
    const { method, endpoint } = ENDPOINTS.facturas.getClientes;
    const response = await fetch(`${URL}${ROUTES.factura}${endpoint}`, {
      method,
      headers: headersApi,
    });
    const json = await response.json();
    console.log(json);
    return json;
  };
  const obtenerClientesPorRfc = async (clientRfc) => {
    const { method, endpoint } = ENDPOINTS.facturas.getClientesPorRfc;
    const response = await fetch(
      `${URL}${ROUTES.factura}${endpoint}?clientRfc=${clientRfc}`,
      {
        method,
        headers: headersApi,
      }
    );
    const json = await response.json();
    console.log(json);
    return json;
  };
  const obtenerClientesPorId = async (clientid) => {
    const { method, endpoint } = ENDPOINTS.facturas.getClientesPorId;
    const response = await fetch(
      `${URL}${ROUTES.factura}${endpoint}?clientId=${clientid}`,
      {
        method,
        headers: headersApi,
      }
    );
    const json = await response.json();
    console.log(json);
    return json;
  };
  const obtenerlistaCfdisPorCliente = async (rfc) => {
    const { method, endpoint } = ENDPOINTS.facturas.getCfdi;
    const response = await fetch(
      `${URL}${ROUTES.factura}${endpoint}?rfc=${rfc}`,
      {
        method,
        headers: headersApi,
      }
    );
    const json = await response.json();
    console.log(json);
    return json;
  };
  const descargarFactura = async (cfdi_id) => {
    const { method, endpoint } = ENDPOINTS.facturas.downloadCfdi;
    const response = await fetch(`${URL}${ROUTES.factura}${endpoint}`, {
      method,
      headers: headersApi,
      body: JSON.stringify({ cfdi_id }),
    });
    const json = await response.json();
    console.log(json);
    return json;
  };
  const mandarCorreo = async (id_cfdi, email) => {
    const { method, endpoint } = ENDPOINTS.facturas.sendEmail;
    const response = await fetch(`${URL}${ROUTES.factura}${endpoint}`, {
      method,
      headers: headersApi,
      body: JSON.stringify({ id_cfdi, email }),
    });
    const json = await response.json();
    console.log(json);
    return json;
  };
  const crearCfdi = async (cfdi) => {
    const { method, endpoint } = ENDPOINTS.facturas.createCfdi;
    const response = await fetch(`${URL}${ROUTES.factura}${endpoint}`, {
      method,
      headers: headersApi,
      body: JSON.stringify({ cfdi }),
    });
    const json = await response.json();
    console.log(json);
    return json;
  };
  const crearClient = async (client) => {
    const { method, endpoint } = ENDPOINTS.facturas.createClient;
    const response = await fetch(`${URL}${ROUTES.factura}${endpoint}`, {
      method,
      headers: headersApi,
      body: JSON.stringify({ client }),
    });
    const json = await response.json();
    console.log(json);
    return json;
  };

  return {
    crearSessionCheckout,
    obtenerSessionCheckout,
    obtenerClientes,
    obtenerClientesPorRfc,
    obtenerClientesPorId,
    obtenerlistaCfdisPorCliente,
    descargarFactura,
    mandarCorreo,
    crearCfdi,
    crearClient,
  };
};

const ENDPOINTS = {
  create: "/create-checkout-session",
  retrieve: "/get-checkout-session",
  facturas: {
    getClientes: {
      method: "GET",
      endpoint: "/clients",
    },
    getClientesPorRfc: {
      method: "GET",
      endpoint: "/clients/rfc",
    },
    getClientesPorId: {
      method: "GET",
      endpoint: "/clients/id",
    },
    getCfdi: {
      method: "GET",
      endpoint: "/invoice",
    },
    createClient: {
      method: "POST",
      endpoint: "/clients",
    },
    createCfdi: {
      method: "POST",
      endpoint: "/cfdi",
    },
    downloadCfdi: {
      method: "POST",
      endpoint: "/download",
    },
    sendEmail: {
      method: "POST",
      endpoint: "/send-email",
    },
  },
};
const URL = "https://mianoktos.vercel.app";
const ROUTES = {
  stripe: "/v1/stripe",
  factura: "/v1/factura",
};
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const headersApi = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};
export default useApi;
