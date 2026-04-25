import { useState } from "react";

function AuthForm({
  title,
  onSubmit,
  buttonText,
  alternateText,
  alternateLinkText,
  onAlternateClick,
  showNameField = false,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const result = await onSubmit({ name, email, password });
    setMessage(result.message);
    setIsLoading(false);
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className="form">
        {showNameField && (
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : buttonText}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="alternate-action">
        {alternateText}{" "}
        <button className="link-button" onClick={onAlternateClick} type="button">
          {alternateLinkText}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
