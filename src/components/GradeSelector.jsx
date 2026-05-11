function GradeSelector({ currentGrade, onGradeChange }) {
  const grades = [1, 2, 3, 4, 5, 6]

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {grades.map((g) => (
        <button
          key={g}
          onClick={() => onGradeChange(g)}
          className={`px-5 py-2 rounded-full text-base font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
            currentGrade === g
              ? 'bg-primary text-white shadow-md shadow-primary/30'
              : 'bg-white text-primary border-2 border-primary hover:bg-primary/5'
          }`}
        >
          {g}年级
        </button>
      ))}
    </div>
  )
}

export default GradeSelector
