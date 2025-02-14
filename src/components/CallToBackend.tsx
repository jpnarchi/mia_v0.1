export const CallToBackend = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get("session");

  if (!session) {
    //Este lo puse para que siempre se llame, solo quitalo para que se llame solo cuando exista ese parametro
    obtenerSessionCheckout(
      "cs_live_a10ETlnCEAsKIlJNvhJTRtlQJoAwy8V6zWSAYER15SOesH0dE67tTYGHg6"
    ); //Aqui manda el id de la session de la url, te puse un id de prueba para que veas que responde
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    crearSessionCheckout();
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Enviar</button>
    </form>
  );
};

const URL = "http://localhost:3000";
const ROUTES = {
  stripe: "/v1/stripe",
};
const ENDPOINTS = {
  create: "/create-checkout-session",
  retrieve: "/get-checkout-session",
};
const API_KEY = "";
const AUTH = {
  "x-api-key": API_KEY,
};

const obtenerSessionCheckout = async (ID_CHECKOUT_SESSION) => {
  const response = await fetch(
    `${URL}${ROUTES.stripe}${ENDPOINTS.retrieve}?id_checkout=${ID_CHECKOUT_SESSION}`,
    {
      method: "GET",
      headers: AUTH,
    }
  ); //Este es para obtener los datos, solo faltaria que los extraigas de los parametros de la URL
  const json = await response.json();
  console.log(json);
};

const DOMAIN = "http://localhost:5173";
const payment_metadata = {};
const payment_data = {
  line_items: [
    {
      price_data: {
        currency: "mxn", // Moneda
        product_data: {
          name: "Producto Ejemplo", // Nombre del producto,
          description: "Producto de ejemplo para stripe",
          images: [
            "https://www.tvtime.com/_next/image?url=https%3A%2F%2Fartworks.thetvdb.com%2Fbanners%2Fv4%2Fmovie%2F567%2Fposters%2F668ad17fe053a.jpg",
          ],
        },
        unit_amount: 1010, // Monto en centavos => $10.10
      },
      quantity: 1, // Cantidad de productos
    },
    /*{
      price_data: {
        currency: 'mxn', 
        product_data: {
          name: 'Producto Ejemplo 2', 
        },
        unit_amount: 2030, 
      },
      quantity: 1, 
    },
    {
      price_data: {
        currency: 'mxn', 
        product_data: {
          name: 'Producto Ejemplo 3', 
        },
        unit_amount: 1020, 
      },
      quantity: 1, 
    },*/
  ],
  mode: "payment",
  success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(
    payment_metadata
  )}`, // En caso de que necesites mandar datos extras para despues del pago puedes hacerlo aqui, por ejemplo el id de la orden de compra para verificar que se compre o cancelar la compra y asi. Te lo coloque como un json pero si solo vas a mandar el string puede ser sin el json
  cancel_url: `${DOMAIN}?session={CHECKOUT_SESSION_ID}`,
};
const crearSessionCheckout = async () => {
  const response = await fetch(`${URL}${ROUTES.stripe}${ENDPOINTS.create}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AUTH,
    },
    body: JSON.stringify({ payment_data }),
  });
  const json = await response.json();

  /* Se puede guardar en la base de datos la orden antes de enviar la session para que guardes el precio y los productos y una ves que lo tengas guardado mandas a llamar la funcion de window.location.replace() para que puedan pagar, tendras */

  window.location.replace(json.url);
};
