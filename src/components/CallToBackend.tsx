export const CallToBackend = (props) => {
  const { children, paymentData } = props;
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
    crearSessionCheckout(paymentData);
  };

  return (
    <button onClick={handleSubmit} {...props}>
      {children}
    </button>
  );
};

/* LLAMADAS A LA API*/
const URL = "https://mianoktos.vercel.app";
const ROUTES = {
  stripe: "/v1/stripe",
};
const ENDPOINTS = {
  create: "/create-checkout-session",
  retrieve: "/get-checkout-session",
};
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
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

const crearSessionCheckout = async (payment_data) => {
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
