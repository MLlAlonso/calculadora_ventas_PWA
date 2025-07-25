// frontend/app/sales/page.js
'use client'; 

import { useState, useEffect } from 'react';
import '../../styles/globals.scss'; // Asegúrate de que la ruta sea correcta
import Navbar from '../../components/Navbar';
import AddCourse from '../../components/AddCourse';
import QuotationTable from '../../components/QuotationTable';

export default function SalesPage() {
  const [coursesList, setCoursesList] = useState([]);
  const [quotationItems, setQuotationItems] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [usersToAdd, setUsersToAdd] = useState(1);

  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isFormHidden, setIsFormHidden] = useState(false);

  // useEffect para cargar los cursos al inicio
  useEffect(() => {
    const fetchCoursesForSales = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/courses');
        if (!response.ok) {
          throw new Error('Error al obtener la lista de cursos para el vendedor.');
        }
        const data = await response.json();
        setCoursesList(data);
        setLoadingCourses(false);
        if (data.length > 0) {
          // Si hay cursos, selecciona el primero por defecto
          setSelectedCourseId(data[0].id.toString());
        }
      } catch (err) {
        setCalculationError(err.message);
        setLoadingCourses(false);
      }
    };
    fetchCoursesForSales();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  // Manejador para añadir un curso a la cotización
  const handleAddItem = () => {
    setCalculationError(null); // Limpia errores previos
    if (!selectedCourseId || usersToAdd <= 0) {
      setCalculationError('Por favor, selecciona un curso y un número de licencias válido (mayor a 0).');
      return;
    }

    const courseToAdd = coursesList.find(c => c.id.toString() === selectedCourseId);
    if (!courseToAdd) {
      setCalculationError('Curso seleccionado no válido o no encontrado.');
      return;
    }

    const existingItemIndex = quotationItems.findIndex(item => item.courseId === courseToAdd.id);

    if (existingItemIndex !== -1) {
      // Si el curso ya está en la cotización, actualiza la cantidad de usuarios
      const updatedItems = [...quotationItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        users: updatedItems[existingItemIndex].users + usersToAdd
      };
      setQuotationItems(updatedItems);
    } else {
      // Si el curso no está, añádelo
      setQuotationItems([
        ...quotationItems,
        { courseId: courseToAdd.id, users: usersToAdd, name: courseToAdd.name, price: courseToAdd.price }
      ]);
    }

    // Reinicia los campos del formulario
    setSelectedCourseId(coursesList.length > 0 ? coursesList[0].id.toString() : '');
    setUsersToAdd(1);
    setCalculationResult(null); // Borra el resultado de cálculo anterior al añadir un nuevo ítem
  };

  // Manejador para actualizar la cantidad de usuarios de un ítem existente
  const handleUpdateItemUsers = (index, newUsersValue) => {
    const newUsers = parseInt(newUsersValue);
    if (isNaN(newUsers) || newUsers < 0) return; // No permitir valores no numéricos o negativos

    const updatedItems = [...quotationItems];
    updatedItems[index].users = newUsers;
    setQuotationItems(updatedItems);
    setCalculationResult(null); // Borra el resultado de cálculo para forzar un nuevo cálculo
  };

  // Manejador para eliminar un ítem de la cotización
  const handleRemoveItem = (index) => {
    const updatedItems = quotationItems.filter((_, i) => i !== index);
    setQuotationItems(updatedItems);
    setCalculationResult(null); // Borra el resultado de cálculo para forzar un nuevo cálculo
  };

  // useEffect para recalcular automáticamente cuando quotationItems cambia
  useEffect(() => {
    // Solo calcula si hay items y todos tienen usuarios válidos
    if (
      quotationItems.length > 0 &&
      quotationItems.every(item => item.users > 0)
    ) {
      handleCalculate();
    } else {
      // Si no hay ítems o hay alguno con usuarios no válidos, limpia el resultado
      setCalculationResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationItems]); // Dependencia: se ejecuta cuando quotationItems cambia

  // Manejador para enviar la cotización al backend y obtener el cálculo
  const handleCalculate = async () => {
    setCalculationError(null); // Limpia errores previos

    if (quotationItems.length === 0) {
      setCalculationError('Por favor, añade al menos un curso a la cotización antes de calcular.');
      setCalculationResult(null); 
      return;
    }

    const hasInvalidUsers = quotationItems.some(item => item.users <= 0);
    if (hasInvalidUsers) {
        setCalculationError('Todos los cursos en la cotización deben tener al menos 1 licencia (usuario).');
        setCalculationResult(null); 
        return;
    }

    // Mapea los ítems de cotización al formato esperado por el backend
    const apiQuotationItems = quotationItems.map(item => ({
      courseId: item.courseId,
      users: item.users
    }));

    try {
      const response = await fetch('http://localhost:3001/api/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quotationItems: apiQuotationItems }),
      });

      if (!response.ok) {
        // Si la respuesta no es OK (ej. 400, 500), intenta parsear el mensaje de error del backend
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al calcular el precio.');
      }

      const data = await response.json();
      setCalculationResult(data); // Almacena el resultado del cálculo
    } catch (err) {
      setCalculationError(err.message); // Muestra el error si falla la petición
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">

        {/* Botón para ocultar/mostrar el formulario de añadir curso */}
        <div className='hideForm'>
          <button
            id='buttonHideForm'
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()} // Evita que el botón pierda el foco
            onClick={() => setIsFormHidden((prev) => !prev)}>
            {isFormHidden ? (
              <><img src="/icons/icon__visibility.svg" alt="Mostrar formulario" /> Mostrar Formulario </>
            ) : (
              <><img src="/icons/icon__visibility_off.svg" alt="Ocultar formulario" /> Ocultar Formulario </>
            )}
          </button>
        </div>

        {/* Muestra mensajes de error */}
        {calculationError && <p className="errorMessage">{calculationError}</p>}

        {/* Componente para añadir cursos */}
        <AddCourse
          loadingCourses={loadingCourses}
          coursesList={coursesList}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          usersToAdd={usersToAdd}
          setUsersToAdd={setUsersToAdd}
          handleAddItem={handleAddItem}
          isFormHidden={isFormHidden}
        />

        {/* Tabla de cotización o mensaje si no hay ítems */}
        {quotationItems.length === 0 ? (
          <p>Aún no has añadido cursos a la cotización.</p>
        ) : (
          <div className='tableContainer'>
            <QuotationTable
              quotationItems={quotationItems}
              handleUpdateItemUsers={handleUpdateItemUsers}
              handleRemoveItem={handleRemoveItem}
            />
          </div>
        )}

        {/* Sección de resultados del cálculo */}
        <div className="calculation-section">
          {/* Botón de cálculo comentado, se usa useEffect para auto-calcular */}
          {/* <button
            onClick={handleCalculate}
            className="btn-success"
          >
            Calcular Cotización Final
          </button> */}

          {calculationResult && (
            <div>
              <table className="table">
                {/* ¡CORRECCIÓN AQUÍ: SE AÑADIÓ <tbody>! */}
                <tbody>
                  <tr className="tableBody">
                    <td className="--item" style={{ backgroundColor: '#F2F2F3', minWidth: '240px' }}><b>Subtotal</b></td>
                    <td className="--item" style={{ width: '100%' }}>
                      ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calculationResult.subtotal)}
                    </td>
                  </tr>
                  <tr className="tableBody">
                    <td className="--item" style={{ backgroundColor: '#F2F2F3', minWidth: '240px' }}><b>Descuento</b></td>
                    <td className="--item" style={{ width: '100%' }}>{calculationResult.descuentoAplicado}</td>
                  </tr>
                  <tr className="tableBody">
                    <td className="--item" style={{ backgroundColor: '#F2F2F3', minWidth: '240px' }}><b>PVP Total</b></td>
                    <td className="--item" style={{ width: '100%' }}>
                      ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calculationResult.pvp)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center', color: '#60809F' }}>El costo de curso por usuario es de ${calculationResult.precioUnitario} MXN.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}