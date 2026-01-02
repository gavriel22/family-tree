import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// --- IMPORT FIREBASE ---
// Pastikan file firebase.js ada di folder src
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
          <p>Aplikasi pencatatan silsilah keluarga digital untuk menjaga sejarah dan mengeratkan persaudaraan antar generasi.</p>
        </div>
        <div className="footer-section links-section">
          <h4>Menu Pintas</h4>
          <ul>
            <li><Link to="/">Pohon Keluarga</Link></li>
            <li><a href="#">Tentang Aplikasi</a></li>
            <li><a href="#">Bantuan & Panduan</a></li>
          </ul>
        </div>
        <div className="footer-section social-section">
          <h4>Terhubung</h4>
          <div className="social-icons">
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Galur Family Tree.<br/>All rights reserved.</p>
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
  
  // Pastikan person tidak null/undefined
  if (!person) return null;

  const statusClass = person.isAlive === 'false' || person.isAlive === false ? 'deceased' : '';
  
  return (
    <div className={`card ${person.gender} ${statusClass}`} onClick={() => onClick(person)}>
      <div className="card-content-wrapper">
        <div className={`avatar-ring ${statusClass}`}>
          {person.photo ? <img src={person.photo} alt={person.name} /> : <FaUser />}
        </div>
        <div className="card-info">
          <span className="name">
            {person.name}
            {statusClass === 'deceased' && <span className="deceased-badge"> (Alm)</span>}
          </span>
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
        <div className={`modal-header ${person.gender} ${isDeceased ? 'deceased-header' : ''}`}>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
          <h3 className="modal-header-title">Detail Biodata</h3>
        </div>
        <div className="modal-content">
          <div className="modal-profile-summary">
            <div className={`modal-avatar-big ${person.gender} ${isDeceased ? 'deceased-avatar' : ''}`}>
              {person.photo ? <img src={person.photo} alt={person.name} /> : <FaUser />}
            </div>
            <div className="modal-title-text">
              <h2 className="modal-name">
                {person.name} 
                {isDeceased && <span style={{fontSize:'0.6em', color:'#64748b', marginLeft:'5px'}}>(Alm.)</span>}
              </h2>
              <span className={`modal-role ${person.gender}`}>{person.role || "-"}</span>
            </div>
          </div>
          <hr className="divider" />
          <div className="modal-body">
             <div className="info-row">
                <span className="info-icon"><FaHeartbeat /></span>
                <div className="info-text">
                  <label>Status</label>
                  {isDeceased ? <span className="status-badge deceased">Meninggal Dunia (Wafat)</span> : <span className="status-badge alive">Masih Hidup</span>}
                </div>
             </div>
             <div className="info-row"><span className="info-icon"><FaVenusMars /></span><div className="info-text"><label>Jenis Kelamin</label><span>{person.gender==='male'?'Laki-laki':'Perempuan'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaBirthdayCake /></span><div className="info-text"><label>Tanggal Lahir</label><span>{person.birth||'-'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaMapMarkerAlt /></span><div className="info-text"><label>Lokasi Tinggal</label><span>{person.location||'-'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaPhone /></span><div className="info-text"><label>Nomor Telepon</label><span>{person.phone||'-'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaEnvelope /></span><div className="info-text"><label>Alamat Email</label><span>{person.email||'-'}</span></div></div>
             <div className="info-row"><span className="info-icon"><FaGraduationCap /></span><div className="info-text"><label>Pendidikan Terakhir</label><span>{person.education||'-'}</span></div></div>
             <div className="info-row footer-row"><span className="info-icon"><FaIdBadge /></span><div className="info-text"><label>ID Sistem</label><span>{person.id}</span></div></div>
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
  const isDeceased = focusedPerson.isAlive === 'false' || focusedPerson.isAlive === false;

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
          <div className={`avatar-ring main ${focusedPerson.gender} ${isDeceased ? 'deceased-avatar' : ''}`}>
            {focusedPerson.photo ? <img src={focusedPerson.photo} alt={focusedPerson.name} /> : <FaUser />}
          </div>
          <span className="name-main">
             {focusedPerson.name}
             {isDeceased && <span style={{fontSize:'0.6em', color:'#94a3b8', verticalAlign:'middle'}}> (Alm)</span>}
          </span>
          <span className="role-main">{focusedPerson.role}</span>
        </div>
        <div className="main-buttons-bar">
          <div className="main-btn" onClick={(e) => {e.stopPropagation(); onOpenInfo(focusedPerson);}}><FaInfoCircle /> Detail Lengkap</div>
        </div>
      </div>
      {(spouse || children.length > 0) && (
        <div className="connector-hbox">
          <div className="connector-line"></div>
          <div className="descendants-wrapper">
            {spouse && (<div className="descendants-section section-partner"><div className="section-label label-pink">Pasangan</div><MemberCard person={spouse} onClick={onNodeClick} /></div>)}
            {children.length > 0 && (<div className="descendants-section section-children"><div className="section-label label-blue">Anak - Anak</div>{children.map(c => <MemberCard key={c.id} person={c} onClick={onNodeClick} />)}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN PAGE (DENGAN FIX UNDEFINED) ---
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
    setForm({ 
      name: person.name || "", 
      role: person.role || "", 
      gender: person.gender || "male", 
      birth: person.birth || "", 
      isAlive: person.isAlive !== undefined ? person.isAlive : true, 
      location: person.location || "", 
      phone: person.phone || "", 
      email: person.email || "", 
      education: person.education || "" 
    });
    setPhoto(person.photo || "");
    
    // Set logika dropdown relasi
    if (person.parentId) { 
      setRelationType("child"); 
      setSelectedRelativeId(person.parentId); 
    }
    else if (person.partnerId) { 
      setRelationType("partner"); 
      setSelectedRelativeId(person.partnerId); 
    }
    else { 
      setSelectedRelativeId(""); 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setEditId(null); setForm(initialFormState); setPhoto(""); setSelectedRelativeId(""); };

  const handleDelete = (id) => {
    if(window.confirm("Yakin hapus?")) {
      const updatedFamily = family.filter(p => p.id !== id);
      set(ref(db, 'family'), updatedFamily).catch(err => alert("Gagal hapus: " + err.message));
      if(editId === id) handleCancelEdit();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 512000) return alert("File Max 500KB");
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- BAGIAN INI SUDAH DIPERBAIKI (ANTI UNDEFINED) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. SIAPKAN ID YANG AMAN (Angka atau null)
    const inputRelativeId = selectedRelativeId ? parseInt(selectedRelativeId) : null;
    
    // Tentukan nilai baru
    const newParentId  = (relationType === "child") ? inputRelativeId : null;
    const newPartnerId = (relationType === "partner") ? inputRelativeId : null;

    let updatedFamily;

    // A. LOGIKA EDIT (UPDATE)
    if (editId) {
      updatedFamily = family.map(p => {
        if (p.id === editId) {
          // Ambil ID lama, jika undefined ganti null
          const oldParentId = p.parentId !== undefined ? p.parentId : null;
          const oldPartnerId = p.partnerId !== undefined ? p.partnerId : null;

          return {
            ...p, 
            ...form, 
            photo: photo,
            // Jika edit mode Anak: update parentId, pertahankan partnerId lama
            // Jika edit mode Pasangan: update partnerId, pertahankan parentId lama
            parentId: (!isFirstData && relationType === "child") ? newParentId : oldParentId,
            partnerId: (!isFirstData && relationType === "partner") ? newPartnerId : oldPartnerId
          };
        }
        return p;
      });
    } 
    // B. LOGIKA TAMBAH BARU (CREATE)
    else {
      if (!isFirstData && !inputRelativeId) return alert("Pilih Orang Tua / Pasangan dulu!");
      
      const newPerson = {
        id: Date.now(), 
        ...form, 
        photo: photo,
        parentId: (!isFirstData && relationType === "child") ? newParentId : null,
        partnerId: (!isFirstData && relationType === "partner") ? newPartnerId : null
      };
      updatedFamily = [...family, newPerson];
    }

    // C. PEMBERSIH DATA (WAJIB ADA UNTUK FIREBASE)
    // Mengubah semua "undefined" menjadi "null" atau string kosong ""
    const cleanFamily = updatedFamily.map(person => ({
        ...person,
        parentId: person.parentId === undefined ? null : person.parentId,
        partnerId: person.partnerId === undefined ? null : person.partnerId,
        isAlive: person.isAlive === undefined ? true : person.isAlive,
        role: person.role || "",
        email: person.email || "",
        phone: person.phone || "",
        location: person.location || "",
        education: person.education || "",
        photo: person.photo || ""
    }));

    // D. KIRIM KE FIREBASE
    set(ref(db, 'family'), cleanFamily)
      .then(() => {
        alert("BERHASIL DISIMPAN! ✅");
        if(editId) handleCancelEdit();
        else { setForm(initialFormState); setPhoto(""); }
      })
      .catch((err) => {
        console.error(err);
        alert("GAGAL: " + err.message);
      });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRelationTypeChange = (type) => {
    setRelationType(type);
    if(!editId) setForm(prev => ({ ...prev, role: type === 'partner' ? (prev.gender === 'female' ? 'Istri' : 'Suami') : '' }));
  };

  return (
    <div className="admin-container">
      <div className="page-header"><h1>Manajemen Data</h1><p>Halaman Rahasia Admin.</p><Link to="/" style={{color: 'var(--galur-blue)', fontWeight:'bold'}}>← Kembali ke Web Utama</Link></div>
      <div className="form-card">
        <div className="form-header"><h3>{editId ? `Edit: ${form.name}` : (isFirstData ? "Leluhur Utama" : "Tambah Anggota")}</h3>{editId && <button onClick={handleCancelEdit} className="cancel-badge">Batal</button>}</div>
        {!isFirstData && (
          <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <button type="button" onClick={() => handleRelationTypeChange('child')} style={{flex:1, padding:'10px', background:relationType==='child'?'var(--galur-blue)':'#f1f5f9', color:relationType==='child'?'white':'black', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Anak</button>
            <button type="button" onClick={() => handleRelationTypeChange('partner')} style={{flex:1, padding:'10px', background:relationType==='partner'?'var(--galur-pink)':'#f1f5f9', color:relationType==='partner'?'white':'black', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Pasangan</button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Nama Lengkap" value={form.name} onChange={handleChange} required />
          <div style={{display:'flex', gap:'10px'}}>
             <input name="role" placeholder="Status (cth: Anak)" value={form.role} onChange={handleChange} style={{flex:2}} />
             <select name="isAlive" value={form.isAlive} onChange={handleChange} style={{flex:1}}><option value={true}>Hidup</option><option value={false}>Wafat</option></select>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
             <input name="birth" type="date" placeholder="Tgl Lahir" value={form.birth} onChange={handleChange} />
             <select name="gender" value={form.gender} onChange={handleChange}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select>
          </div>
          <input name="location" placeholder="Lokasi" value={form.location} onChange={handleChange} />
          <div style={{display:'flex', gap:'10px'}}>
             <input name="phone" placeholder="No. Telepon" value={form.phone} onChange={handleChange} />
             <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          </div>
          <input name="education" placeholder="Pendidikan" value={form.education} onChange={handleChange} />
          <div style={{marginBottom:'15px', border:'1px dashed #cbd5e1', padding:'10px', borderRadius:'8px'}}>
            <label style={{fontSize:'0.8rem', color:'#777', display:'block', marginBottom:'5px'}}>Foto Profil:</label>
            {photo && <img src={photo} alt="Prev" style={{width:40, height:40, borderRadius:'50%', objectFit:'cover', marginRight:10, verticalAlign:'middle'}} />}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{border:'none', padding:0, width:'auto'}} />
          </div>
          {!isFirstData && (
            <select value={selectedRelativeId} onChange={e => setSelectedRelativeId(e.target.value)} required={!editId}>
              <option value="">-- Hubungkan dengan {relationType === 'child' ? 'Orang Tua' : 'Pasangan'} --</option>
              {family.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button type="submit" className={`save-btn ${editId ? 'edit-mode' : ''}`}>{editId ? "Update Data" : "Simpan Data"}</button>
        </form>
      </div>
      <div className="members-list-container">
         <h3>📂 Database Cloud ({family.length})</h3>
         {family.length === 0 ? <p style={{color:'#94a3b8'}}>Belum ada data di server.</p> : (
           <div className="members-table">
             {family.map(person => (
               <div key={person.id} className="member-row">
                 <div className="member-row-info">
                    <img src={person.photo || "https://via.placeholder.com/40"} alt="avatar" />
                    <div><span className="row-name">{person.name}</span><span className="row-role">{person.role}</span></div>
                 </div>
                 <div className="member-row-actions">
                    <button onClick={() => handleEditClick(person)} className="action-btn edit"><FaEdit /></button>
                    <button onClick={() => handleDelete(person.id)} className="action-btn delete"><FaTrash /></button>
                 </div>
               </div>
             ))}
           </div>
         )}
         {family.length > 0 && (
           <button onClick={() => {if(confirm('Hapus SEMUA data di Server (Permanen)?')) {set(ref(db, 'family'), []);}}} className="reset-all-btn">Reset Database Server</button>
         )}
      </div>
    </div>
  );
};

// --- USER PAGE (DENGAN SAFE FALLBACK) ---
const UserPage = ({ family }) => {
  const [focusedPersonId, setFocusedPersonId] = useState(null);
  const [infoModalData, setInfoModalData] = useState(null);

  // Cari leluhur (parent & partner null)
  const initialRoot = family.find(p => !p.parentId && !p.partnerId);

  useEffect(() => {
    // 1. Prioritas: Leluhur murni
    if (initialRoot && !focusedPersonId) {
       setFocusedPersonId(initialRoot.id);
    }
    // 2. Fallback: Orang pertama di list (agar tidak blank)
    else if (family.length > 0 && !focusedPersonId && !initialRoot) {
       setFocusedPersonId(family[0].id);
    }
  }, [family, initialRoot, focusedPersonId]);

  return (
    <div className="user-page-container">
      <div className="page-header center">
        <h1>Pohon Silsilah</h1>
        <p>Telusuri garis keturunan dan hubungan kekerabatan.</p>
      </div>
      <div className="tree-wrapper">
        {initialRoot && focusedPersonId !== initialRoot.id && (
           <button className="btn-reset-view" onClick={() => setFocusedPersonId(initialRoot.id)}>
            <FaHome /> Kembali ke Leluhur
           </button>
        )}
        {family.length === 0 ? (
           <div className="empty-state">
             <div className="empty-icon"><FaTree /></div>
             <h3>Pohon Belum Ditanam</h3>
             <p>Data silsilah keluarga belum tersedia di server.</p>
           </div>
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
    const unsubscribe = onValue(familyRef, (snapshot) => {
      const data = snapshot.val();
      setFamily(data || []);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<UserPage family={family} />} />
            <Route path="/admin" element={<AdminPage family={family} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;