import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faSquare,
  faTrash,
  faEdit,
  faSortAmountDown,
  faSortNumericDown,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState("All");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [sortType, setSortType] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) setTasks(savedTasks);
    const savedSort = localStorage.getItem("sortType");
    if (savedSort) setSortType(savedSort);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (sortType) {
      localStorage.setItem("sortType", sortType);
      handleSort(sortType, false);
    }
  }, [sortType]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [editIndex]);

  const addTask = () => {
    if (!taskText.trim()) return;
    const newTask = {
      text: taskText,
      completed: editIndex !== null ? tasks[editIndex].completed : false,
      priority,
      dueDate,
    };

    if (editIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = newTask;
      setTasks(updatedTasks);
      setEditIndex(null);
    } else {
      setTasks([...tasks, newTask]);
    }

    setTaskText("");
    setPriority("Medium");
    setDueDate("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  const editTask = (index) => {
    const task = tasks[index];
    setTaskText(task.text);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEditIndex(index);
  };

  const handleFilter = (type) => {
    setFilter(type);
  };

  const handleSort = (type, resetSort = true) => {
    const sorted = [...tasks];
    if (type === "priority") {
      const order = { High: 1, Medium: 2, Low: 3 };
      sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (type === "dueDate") {
      sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    setTasks(sorted);
    if (resetSort) setSortType(type);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const due = new Date(task.dueDate);
    return due < today && due.toDateString() !== today.toDateString();
  };

  const isDueToday = (task) => {
    if (!task.dueDate) return false;
    const today = new Date().toDateString();
    const taskDate = new Date(task.dueDate).toDateString();
    return today === taskDate;
  };

  return (
    <div className="app">
      <h1 style={{ textAlign: "center" }}>Task Manager 📝</h1>

      <div className="input-area">
        <input
          type="text"
          placeholder="Add a task..."
          value={taskText}
          ref={inputRef}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="High">High 🔥</option>
          <option value="Medium">Medium ⚡</option>
          <option value="Low">Low ✅</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button onClick={addTask} disabled={!taskText.trim()}>
          {editIndex !== null ? (
            <>
              <FontAwesomeIcon icon={faEdit} /> Update
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckSquare} /> Add
            </>
          )}
        </button>
      </div>

      <div className="filter-sort">
        <div className="filters">
          <strong>Filter Tasks:</strong>
          <button onClick={() => handleFilter("All")}>All</button>
          <button onClick={() => handleFilter("Completed")}>Completed</button>
          <button onClick={() => handleFilter("Pending")}>Pending</button>
        </div>
        <div className="sorts">
          <strong>Sort Tasks:</strong>
          <button onClick={() => handleSort("priority")}>
            <FontAwesomeIcon icon={faSortAmountDown} /> Priority
          </button>
          <button onClick={() => handleSort("dueDate")}>
            <FontAwesomeIcon icon={faSortNumericDown} /> Due Date
          </button>
        </div>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th>Complete ✔️</th>
            <th>Task Name 📋</th>
            <th>Priority</th>
            <th>Due Date 📅</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task, index) => {
            const overdue = isOverdue(task);
            const dueToday = isDueToday(task);
            return (
              <tr
                key={index}
                className={`${task.completed ? "completed" : ""} ${
                  overdue ? "overdue" : ""
                } ${dueToday ? "due-today" : ""}`}
              >
                <td
                  onClick={() => toggleTask(index)}
                  style={{ cursor: "pointer", textAlign: "center" }}
                  title={
                    task.completed ? "Mark as Incomplete" : "Mark as Complete"
                  }
                >
                  {task.completed ? (
                    <FontAwesomeIcon icon={faCheckSquare} color="green" />
                  ) : (
                    <FontAwesomeIcon
                      icon={faSquare}
                      color="grey"
                      style={{
                        borderRadius: "4px",
                        padding: "2px",
                        border: "1px solid grey",
                      }}
                    />
                  )}
                </td>
                <td>{task.text}</td>
                <td>
                  {task.priority === "High" && "🔥 "}
                  {task.priority === "Medium" && "⚡ "}
                  {task.priority === "Low" && "✅ "}
                  {task.priority}
                </td>
                <td>
                  {task.dueDate}
                  {overdue && (
                    <span style={{ color: "red", marginLeft: "5px" }}>
                      {" "}
                      (Overdue)
                    </span>
                  )}
                  {dueToday && (
                    <span style={{ color: "orange", marginLeft: "5px" }}>
                      {" "}
                      (Today)
                    </span>
                  )}
                </td>
                <td className="actions">
                  <button onClick={() => editTask(index)} title="Edit Task">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => deleteTask(index)}
                    title="Delete Task"
                    style={{ color: "red" }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
