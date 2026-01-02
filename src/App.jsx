import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// --- IMPORT FIREBASE ---
import { db } from './firebase';
import { ref, onValue, set } from "firebase/database";
// -----------------------
import { 
  FaUser, FaInfoCircle, FaHome, FaPhone, FaMapMarkerAlt, 
  FaEnvelope, FaGraduationCap, FaVenusMars, FaBirthdayCake, FaIdBadge, 
  FaHeartbeat, FaEdit, FaTrash, FaTree, FaInstagram, FaFacebook, FaTwitter
} from 'react-icons/fa'; 
import './App.css';

// --- KOMPONEN NAVBAR ---
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><FaTree /></div>
          <span className="brand-text">Galur<span className="brand-highlight">Family</span></span>
        </Link>
      </div>
    </nav>
  );
};

// --- KOMPONEN FOOTER ---
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <h3><FaTree /> GalurFamily</h3>
          <p>Aplikasi pencatatan silsilah keluarga digital.</p>
        </div>
        <div className="footer-section links-section">
          <h4>Menu Pintas</h4>
          <ul><li><Link to="/">Pohon Keluarga</Link></li></ul>
        </div>
        <div className="footer-section social-section">
          <p className="copyright">&copy; {new Date().getFullYear()} Galur Family.</p>
        </div>
      </div>
    </footer>
  );
};

// --- MEMBER CARD ---
const MemberCard = ({ person, onClick, isDummy = false, dummyLabel = "" }) => {
  if (isDummy) {
    return (
      <div className="card dummy">
        <div className="card-content-wrapper">
          <div className="avatar-ring dummy"><FaUser /></div>
          <div className="card-info"><span className="name">{dummyLabel}</span><span className="role">Data Kosong</span></div>
        </div>
      </div>
    );
  }
  const statusClass = person.isAlive === 'false' || person.isAlive === false ? 'deceased' : '';
  return (
    <div className={`card ${person.gender} ${statusClass}`} onClick={() => onClick(person)}>
      <div className="card-content-wrapper">
        <div className={`avatar-ring ${statusClass}`}>
          {person.photo ? <img src={person.photo} alt={person.name} /> : <FaUser />}
        </div>
        <div className="card-info">
          <span className="name">{person.name}</span>
          <span className="role">{person.role || "Anggota"}</span>
        </div>
      </div>
    </div>
  );
};

// --- INFO MODAL ---
const InfoModal = ({ person, onClose }) => {
  if (!person) return null;
  const isDeceased = person.isAlive === 'false' || person.isAlive === false;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${person.gender}`}>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
          <h3 className="modal-header-title">Detail Biodata</h3>
        </div>
        <div className="modal-content">
          <div className="modal-profile-summary">
            <div className={`modal-avatar-big ${person.gender}`}>
              {person.photo ? <img src={person.photo} alt={person.name} /> : <FaUser />}
            </div>
            <div className="modal-title-text">
              <h2 className="modal-name">{person.name}</h2>
              <span className={`modal-role ${person.gender}`}>{person.role || "-"}</span>
            </div>
          </div>
          <hr className="divider" />
          <div className="modal-body">
             <div className="info-row"><span className="info-icon"><FaVenusMars /></span><div className="info-text"><label>Gender</label><span>{person.gender==='male'?'Laki-laki':'Perempuan'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaBirthdayCake /></span><div className="info-text"><label>Lahir</label><span>{person.birth||'-'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaMapMarkerAlt /></span><div className="info-text"><label>Lokasi</label><span>{person.location||'-'}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LINEAGE VIEW ---
const LineageView = ({ focusedPerson, family, onNodeClick, onOpenInfo }) => {
  const [showDummyParents, setShowDummyParents] = useState(false);
  useEffect(() => setShowDummyParents(false), [focusedPerson]);

  if (!focusedPerson) return null;

  const parent = family.find(p => p.id === focusedPerson.parentId);
  const parentPartner = parent ? family.find(p => p.partnerId === parent.id || p.id === parent.partnerId) : null;
  const hasBiologicalParents = parent || parentPartner;
  const spouse = family.find(p => p.partnerId === focusedPerson.id || p.id === focusedPerson.partnerId);
  const children = family.filter(p => p.parentId === focusedPerson.id || (spouse && p.parentId === spouse.id));

  return (
    <div className="lineage-group">
      {hasBiologicalParents && (
        <div className="connector-hbox">
          <div className="parents-section">
            {parent && <MemberCard person={parent} onClick={onNodeClick} />}
            {parentPartner && <MemberCard person={parentPartner} onClick={onNodeClick} />}
          </div>
          <div className="connector-line"></div>
        </div>
      )}
      {!hasBiologicalParents && showDummyParents && (
        <div className="connector-hbox fade-in-anim">
          <div className="parents-section dummy-parents"><MemberCard isDummy={true} dummyLabel="Ayah" /><MemberCard isDummy={true} dummyLabel="Ibu" /></div>
          <div className="connector-line" style={{borderLeftStyle:'dashed'}}></div>
        </div>
      )}
      <div className={`main-focus-container ${focusedPerson.gender}`} style={{cursor: !hasBiologicalParents ? 'pointer' : 'default'}}>
        <div className="card-main" onClick={() => {if (!hasBiologicalParents) setShowDummyParents(!showDummyParents);}}>
          <div className={`avatar-ring main ${focusedPerson.gender}`}>
            {focusedPerson.photo ? <img src={focusedPerson.photo} alt={focusedPerson.name} /> : <FaUser />}
          </div>
          <span className="name-main">{focusedPerson.name}</span>
          <span className="role-main">{focusedPerson.role}</span>
        </div>
        <div className="main-buttons-bar">
          <div className="main-btn" onClick={(e) => {e.stopPropagation(); onOpenInfo(focusedPerson);}}><FaInfoCircle /> Detail</div>
        </div>
      </div>
      {(spouse || children.length > 0) && (
        <div className="connector-hbox">
          <div className="connector-line"></div>
          <div className="descendants-wrapper">
            {spouse && (<div className="descendants-section section-partner"><div className="section-label label-pink">Pasangan</div><MemberCard person={spouse} onClick={onNodeClick} /></div>)}
            {children.length > 0 && (<div className="descendants-section section-children"><div className="section-label label-blue">Anak</div>{children.map(c => <MemberCard key={c.id} person={c} onClick={onNodeClick} />)}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN PAGE ---
const AdminPage = ({ family }) => {
  const initialFormState = { name: "", role: "", gender: "male", birth: "", isAlive: true, location: "", phone: "", email: "", education: "" };
  const [form, setForm] = useState(initialFormState);
  const [photo, setPhoto] = useState("");
  const [relationType, setRelationType] = useState("child");
  const [selectedRelativeId, setSelectedRelativeId] = useState("");
  const [editId, setEditId] = useState(null);
  const isFirstData = family.length === 0;

  const handleEditClick = (person) => {
    setEditId(person.id);
    setForm({ name: person.name, role: person.role, gender: person.gender, birth: person.birth, isAlive: person.isAlive ?? true, location: person.location, phone: person.phone, email: person.email, education: person.education });
    setPhoto(person.photo || "");
    if (person.parentId) { setRelationType("child"); setSelectedRelativeId(person.parentId); }
    else if (person.partnerId) { setRelationType("partner"); setSelectedRelativeId(person.partnerId); }
    else { setSelectedRelativeId(""); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setEditId(null); setForm(initialFormState); setPhoto(""); setSelectedRelativeId(""); };

  const handleDelete = (id) => {
    if(window.confirm("Yakin hapus?")) {
      const updatedFamily = family.filter(p => p.id !== id);
      set(ref(db, 'family'), updatedFamily);
      if(editId === id) handleCancelEdit();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedFamily;
    if (editId) {
      updatedFamily = family.map(p => {
        if (p.id === editId) {
          return { ...p, ...form, photo: photo, parentId: (!isFirstData && relationType === "child") ? parseInt(selectedRelativeId) : p.parentId, partnerId: (!isFirstData && relationType === "partner") ? parseInt(selectedRelativeId) : p.partnerId };
        } return p;
      });
    } else {
      if (!isFirstData && !selectedRelativeId) return alert("Pilih Orang Tua / Pasangan!");
      const newPerson = { id: Date.now(), ...form, photo: photo, parentId: (relationType === "child" && !isFirstData) ? parseInt(selectedRelativeId) : null, partnerId: (relationType === "partner" && !isFirstData) ? parseInt(selectedRelativeId) : null };
      updatedFamily = [...family, newPerson];
    }
    set(ref(db, 'family'), updatedFamily).then(() => { alert("Disimpan!"); if(editId) handleCancelEdit(); else { setForm(initialFormState); setPhoto(""); } });
  };

  return (
    <div className="admin-container">
      <div className="page-header"><h1>Manajemen Data</h1><Link to="/">← Kembali ke Web Utama</Link></div>
      <div className="form-card">
        <h3>{editId ? "Edit Anggota" : "Tambah Anggota"}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Nama" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          <input name="role" placeholder="Status" value={form.role} onChange={e => setForm({...form, role:e.target.value})} />
          <div style={{margin:'10px 0'}}><label>Foto:</label><input type="file" onChange={handleImageUpload} /></div>
          {!isFirstData && (
             <div>
               <select onChange={e => setRelationType(e.target.value)} value={relationType}>
                 <option value="child">Sebagai Anak</option><option value="partner">Sebagai Pasangan</option>
               </select>
               <select value={selectedRelativeId} onChange={e => setSelectedRelativeId(e.target.value)} required={!editId}>
                 <option value="">-- Pilih Kerabat --</option>
                 {family.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
          )}
          <button type="submit" className="save-btn">Simpan</button>
          {editId && <button type="button" onClick={handleCancelEdit}>Batal</button>}
        </form>
      </div>
      <div className="members-list-container">
         {family.map(p => (
           <div key={p.id} className="member-row" style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
             <span>{p.name} ({p.role})</span>
             <div>
               <button onClick={() => handleEditClick(p)} style={{marginRight:'5px'}}>Edit</button>
               <button onClick={() => handleDelete(p.id)}>Hapus</button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// --- USER PAGE (PERBAIKAN LOGIKA) ---
const UserPage = ({ family }) => {
  const [focusedPersonId, setFocusedPersonId] = useState(null);
  const [infoModalData, setInfoModalData] = useState(null);

  // --- BAGIAN INI YANG DIPERBAIKI ---
  // Kita cari orang yang parentId-nya kosong (null, undefined, atau 0)
  // DAN partnerId-nya juga kosong.
  const initialRoot = family.find(p => !p.parentId && !p.partnerId); 

  useEffect(() => {
    // Jika belum ada fokus, dan ketemu leluhur, set fokus ke leluhur itu
    if (initialRoot && !focusedPersonId) {
       setFocusedPersonId(initialRoot.id);
    }
    // Jika data ada TAPI tidak ketemu leluhur (kasus langka), paksa ambil orang pertama di array
    else if (family.length > 0 && !focusedPersonId && !initialRoot) {
       setFocusedPersonId(family[0].id);
    }
  }, [family, initialRoot, focusedPersonId]);
  // ----------------------------------

  return (
    <div className="user-page-container">
      <div className="page-header center"><h1>Pohon Silsilah</h1></div>
      <div className="tree-wrapper">
        {family.length === 0 ? (
           <div className="empty-state"><h3>Pohon Belum Ditanam</h3></div>
        ) : (
          <LineageView 
             focusedPerson={family.find(p => p.id === focusedPersonId)} 
             family={family} 
             onNodeClick={(p) => setFocusedPersonId(p.id)}
             onOpenInfo={(p) => setInfoModalData(p)} 
          />
        )}
      </div>
      <InfoModal person={infoModalData} onClose={() => setInfoModalData(null)} />
    </div>
  );
};

// --- APP ROOT ---
function App() {
  const [family, setFamily] = useState([]);
  useEffect(() => {
    const familyRef = ref(db, 'family');
    return onValue(familyRef, (snapshot) => {
      const data = snapshot.val();
      setFamily(data || []);
    });
  }, []);

  return (
    <Router>
      <div className="app-layout">
        <Navbar /><div className="app-content"><Routes><Route path="/" element={<UserPage family={family} />} /><Route path="/admin" element={<AdminPage family={family} />} /></Routes></div><Footer />
      </div>
    </Router>
  );
}

export default App;