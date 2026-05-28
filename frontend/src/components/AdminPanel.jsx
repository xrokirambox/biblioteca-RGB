import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

export default function AdminPanel() {
  const { saveLink } = useLibrary();

  const [grado, setGrado] = useState("");
  const [materia, setMateria] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await saveLink(grado, materia, url);

    setGrado("");
    setMateria("");
    setUrl("");
  };a

  return (
    <div>
      <h2>Panel Admin</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Grado"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        />

        <input
          placeholder="Materia"
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}