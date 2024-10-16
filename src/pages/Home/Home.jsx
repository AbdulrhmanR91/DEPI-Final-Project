import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar.jsx/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNote";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axiosInstance from './../../utils/axiosInstance';
import Toast from "../../components/ToastMessage/Toast";
import EmptyNotes from "../../components/EmptyNotes/EmptyNotes";
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg";

const Home = () => {
  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModel({ isShown: true, type: "edit", data: noteDetails });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: ""
    });
  };

  // استخدام useCallback لتغليف getUserInfo
  const getUserInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }, [navigate]);

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.error("An unexpected error occurred. Please try again.");
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Task Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      console.error("An unexpected error occurred. Please try again.");
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        showToastMessage("Task Pinned Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  // الآن، getUserInfo لن تتغير بين عمليات الريندر
  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, [getUserInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto px-4 py-8">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyNotes
            imgSrc={isSearch ? NoDataImg : AddNotesImg}
            message={
              isSearch
                ? "Oops! No Tasks found"
                : "Click the 'Add' Button to jot down your ideas, thoughts, and reminders. Let's get started!"
            }
          />
        )}
      </div>

      <button
        className="fixed right-8 bottom-8 w-16 h-16 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 transition-colors duration-300 shadow-lg"
        onClick={() => {
          setOpenAddEditModel({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-3xl text-white" />
      </button>

      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            width: '90%',
            maxWidth: '500px',
            margin: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none',
          },
        }}
        contentLabel="Add/Edit Note"
      >
        <AddEditNotes
          type={openAddEditModel.type}
          noteData={openAddEditModel.data}
          onclose={() => {
            setOpenAddEditModel({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onclose={handleCloseToast}
      />
    </div>
  );
};

export default Home;
