import React from 'react';

interface AddCourseProps {
  loadingCourses: boolean;
  coursesList: any[];
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  usersToAdd: number;
  setUsersToAdd: (users: number) => void;
  handleAddItem: () => void;
  isFormHidden?: boolean;
}

export default function AddCourse({
  loadingCourses,
  coursesList,
  selectedCourseId,
  setSelectedCourseId,
  usersToAdd,
  setUsersToAdd,
  handleAddItem,
  isFormHidden = false,
}: AddCourseProps) {
  return (
    <div
        id="formAddCourse"
        className={isFormHidden ? "hide" : ""}
    >

        {/*-- INPUT - ESTUDIANTES --*/}
        <label className='label'>
          Número de estudiantes:
          <input
            type="number"
            value={usersToAdd}
            onChange={(e) => setUsersToAdd(parseInt(e.target.value) || 0)}
            min="1"
          />
        </label>

        {/* --  SELECT - CURSOS -- */}
        <label className='label'>
        Curso:
        {loadingCourses ? (
            <p>Cargando cursos...</p>
        ) : (
            <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            >
            {coursesList.length === 0 ? (
                <option value="">No hay cursos disponibles (Añádelos como Administrador)</option>
            ) : (
                <>
                <option value="">-- Selecciona un curso</option>
                {coursesList.map((course) => (
                    <option key={course.id} value={course.id.toString()}>
                    {course.name} (${course.price.toFixed(2)})
                    </option>
                ))}
                </>
            )}
            </select>
        )}
        </label>

        <button
            onClick={handleAddItem}
            className="button"
        >
            Añadir Curso
        </button>
    </div>
  );
}