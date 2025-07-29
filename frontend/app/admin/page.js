// frontend/app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import "../../styles/globals.scss";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [coursesList, setCoursesList] = useState([]);
  const [adminError, setAdminError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === "hub2025") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Contraseña incorrecta. Inténtalo de nuevo.");
      setPassword("");
    }
  };

  const fetchCourses = async () => {
    setAdminError(null);
    try {
      // Usa la variable de entorno para la URL
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) {
        throw new Error("Error al obtener la lista de cursos.");
      }
      const data = await response.json();
      setCoursesList(data);
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const handleAddOrUpdateCourse = async () => {
    setAdminError(null);
    if (
      !courseName.trim() ||
      !coursePrice.trim() ||
      isNaN(parseFloat(coursePrice))
    ) {
      setAdminError(
        "Por favor, ingresa un nombre y un precio válido (numérico) para el curso."
      );
      return;
    }

    try {
      const method = editingCourse ? "PUT" : "POST";
      // Usa la variable de entorno para la URL
      const url = editingCourse
        ? `${API_BASE_URL}/courses/${editingCourse.id}`
        : `${API_BASE_URL}/courses`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: courseName,
          price: parseFloat(coursePrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error al ${editingCourse ? "actualizar" : "añadir"} el curso.`
        );
      }

      setCourseName("");
      setCoursePrice("");
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCoursePrice(course.price.toString());
  };

  const handleDeleteCourse = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este curso? Esta acción es irreversible."
      )
    ) {
      return;
    }

    setAdminError(null);
    try {
      // Usa la variable de entorno para la URL
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el curso.");
      }

      fetchCourses();
    } catch (err) {
      setAdminError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container auth-container">
        {" "}
        {/* */}
        <h2>Acceso de Administrador Requerido</h2>
        <p>Por favor, ingresa la contraseña para continuar:</p>
        <div className="form-group">
          {" "}
          {/* Clase para agrupar elementos de formulario */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <button onClick={handleLogin} className="btn-primary">
            {" "}
            {/* Clase de botón */}
            Acceder
          </button>
        </div>
        {authError && <p className="error-message">{authError}</p>}{" "}
        {/* Clase de mensaje de error */}
      </div>
    );
  }

  return (
    <div className="container">
      <h1>⚙️ Administración de Cursos</h1>

      {adminError && <p className="error-message">{adminError}</p>}

      <div className="form-section">
        {" "}
        {/* Clase para la sección del formulario */}
        <h3>{editingCourse ? "Editar Curso" : "Añadir Nuevo Curso"}</h3>
        <div className="form-group">
          <label>
            Nombre del Curso:
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Ej: Curso de Ciberseguridad Básica"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Precio:
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              placeholder="Ej: 99.99"
              step="0.01"
            />
          </label>
        </div>
        <button
          onClick={handleAddOrUpdateCourse}
          className={editingCourse ? "btn-warning" : "btn-success"} // Clases de botón condicionales
        >
          {editingCourse ? "Actualizar Curso" : "Guardar Curso"}
        </button>
        {editingCourse && (
          <button
            onClick={() => {
              setEditingCourse(null);
              setCourseName("");
              setCoursePrice("");
            }}
            className="btn-secondary" // Clase de botón
            style={{ marginLeft: "10px" }} // Mantener estilo en línea para margen específico
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <h3>Cursos Existentes ({coursesList.length})</h3>
      {coursesList.length === 0 ? (
        <p>No hay cursos añadidos aún.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {" "}
              {/* */}
              <th>ID</th>
              <th>Nombre del Curso</th>
              <th>Precio</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coursesList.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>${course.price.toFixed(2)}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => handleEditClick(course)}
                    className="btn-warning"
                    style={{ marginRight: "5px" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}