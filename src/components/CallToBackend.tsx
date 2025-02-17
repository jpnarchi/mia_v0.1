import useApi from "../hooks/useApi.ts";

export const CallToBackend = (props) => {
  const { crearSessionCheckout, obtenerSessionCheckout } = useApi();
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
