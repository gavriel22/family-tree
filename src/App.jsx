import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
// --- IMPORT FIREBASE ---
import { db } from './firebase';
import { ref, onValue, set } from "firebase/database";
// -----------------------
import { 
  FaUser, FaInfoCircle, FaPhone, FaMapMarkerAlt, 
  FaEnvelope, FaGraduationCap, FaVenusMars, FaBirthdayCake, 
  FaHeartbeat, FaEdit, FaTrash, FaTree, FaInstagram, FaFacebook, FaTwitter, 
  FaArrowLeft, FaSearch 
} from 'react-icons/fa'; 
import './App.css';

// --- KOMPONEN NAVBAR ---
const Navbar = ({ family }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (text.length > 0 && family) {
      const matches = family.filter(person => 
        person.name.toLowerCase().includes(text.toLowerCase())
      );
      setResults(matches.slice(0, 5)); 
    } else {
      setResults([]);
    }
  };

  const handleSelect = (id) => {
    navigate(`/person/${id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><FaTree /></div>
          <span className="brand-text">Galur<span className="brand-highlight">Family</span></span>
        </Link>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari anggota..." 
              value={query}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          {results.length > 0 && (
            <div className="search-results">
              {results.map(person => (
                <div key={person.id} className="search-item" onClick={() => handleSelect(person.id)}>
                  <img src={person.photo || "https://via.placeholder.com/30"} alt="avatar" />
                  <div className="search-item-info">
                    <span className="search-name">{person.name}</span>
                    <span className="search-role">{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
          <p>Merawat silsilah, menjaga sejarah.</p>
        </div>
        <div className="footer-section links-section">
          <div className="social-icons">
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
          </div>
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
  
  if (!person) return null;

  const statusClass = person.isAlive === 'false' || person.isAlive === false ? 'deceased' : '';
  
  return (
    <div className={`card ${person.gender} ${statusClass}`} onClick={(e) => onClick && onClick(person)}>
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
          <div className="modal-body">
              <div className="info-row"><span className="info-icon"><FaHeartbeat /></span><div className="info-text"><label>Status</label>{isDeceased ? <span className="status-badge deceased">Meninggal Dunia</span> : <span className="status-badge alive">Masih Hidup</span>}</div></div>
              <div className="info-row"><span className="info-icon"><FaVenusMars /></span><div className="info-text"><label>Jenis Kelamin</label><span>{person.gender==='male'?'Laki-laki':'Perempuan'}</span></div></div>
              <div className="info-row"><span className="info-icon"><FaBirthdayCake /></span><div className="info-text"><label>Tanggal Lahir</label><span>{person.birth||'-'}</span></div></div>
              <div className="info-row"><span className="info-icon"><FaMapMarkerAlt /></span><div className="info-text"><label>Lokasi Tinggal</label><span>{person.location||'-'}</span></div></div>
              <div className="info-row"><span className="info-icon"><FaPhone /></span><div className="info-text"><label>Nomor Telepon</label><span>{person.phone||'-'}</span></div></div>
              <div className="info-row"><span className="info-icon"><FaEnvelope /></span><div className="info-text"><label>Alamat Email</label><span>{person.email||'-'}</span></div></div>
              <div className="info-row"><span className="info-icon"><FaGraduationCap /></span><div className="info-text"><label>Pendidikan Terakhir</label><span>{person.education||'-'}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PERSON DETAIL PAGE ---
const PersonDetailPage = ({ family }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [infoModalData, setInfoModalData] = useState(null);

  const person = family.find(p => p.id.toString() === id);

  if (!person) return <div className="user-page-container"><div className="empty-state"><h3>Data Tidak Ditemukan</h3><button className="back-btn" onClick={() => navigate('/')} style={{marginTop:20}}>Kembali</button></div></div>;

  const spouse = family.find(p => p.partnerId === person.id || p.id === person.partnerId);

  let parentMain = null;
  let parentSpouse = null;
  if (person.parentId) {
    parentMain = family.find(p => p.id === person.parentId);
    if (parentMain) {
      parentSpouse = family.find(p => p.partnerId === parentMain.id || p.id === parentMain.partnerId);
    }
  }

  const children = family.filter(p => p.parentId === person.id || (spouse && p.parentId === spouse.id));
  children.sort((a, b) => new Date(a.birth) - new Date(b.birth));

  const handleCardClick = (targetPerson) => {
    navigate(`/person/${targetPerson.id}`);
  };

  return (
    <div className="detail-page-container">
      <button className="back-btn" onClick={() => navigate('/')}><FaArrowLeft /> Kembali ke Pohon Utama</button>
      
      <div className="detail-layout">
        <div className="generation-section">
          <h4 className="generation-title">Generasi Atas (Orang Tua)</h4>
          <div className="generation-row">
            {parentMain ? (
              <>
                <div className="node-individual">
                   <MemberCard person={parentMain} onClick={handleCardClick} />
                </div>
                {parentSpouse && (
                  <>
                    <div className="spouse-connector-static">❤</div>
                    <div className="node-individual">
                      <MemberCard person={parentSpouse} onClick={handleCardClick} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="no-data-text">Data orang tua tidak tercatat.</p>
            )}
          </div>
        </div>

        <div className="vertical-line"></div>

        <div className="generation-section focus-section">
          <div className="generation-row">
            <div className="node-individual focus-highlight">
              <MemberCard person={person} onClick={() => setInfoModalData(person)} />
              <div className="focus-badge">Profil Utama</div>
            </div>
            
            {spouse && (
              <>
                  <div className="spouse-connector-static">❤</div>
                  <div className="node-individual">
                     <MemberCard person={spouse} onClick={handleCardClick} />
                  </div>
              </>
            )}
          </div>
        </div>

        {children.length > 0 && <div className="vertical-line"></div>}

        {children.length > 0 && (
          <div className="generation-section">
            <h4 className="generation-title">Generasi Bawah (Anak-Anak)</h4>
            <div className="generation-row children-row">
              {children.map(child => (
                <div key={child.id} className="node-individual">
                  <MemberCard person={child} onClick={handleCardClick} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <InfoModal person={infoModalData} onClose={() => setInfoModalData(null)} />
    </div>
  );
};


// --- TREE NODE ---
const TreeNode = ({ person, family, onOpenInfo }) => {
  const navigate = useNavigate();
  const spouse = family.find(p => p.partnerId === person.id || p.id === person.partnerId);
  const children = family.filter(p => p.parentId === person.id || (spouse && p.parentId === spouse.id));
  children.sort((a, b) => new Date(a.birth) - new Date(b.birth));

  const handleNavigate = (p) => {
    navigate(`/person/${p.id}`);
  };

  return (
    <li className="tree-node">
      <div className="node-content">
        <div className="couple-wrapper">
          
          {/* ORANG PERTAMA */}
          <div className="node-individual">
            <MemberCard person={person} onClick={handleNavigate} />
            <button 
              className="mini-info-btn"
              onClick={(e) => {e.stopPropagation(); onOpenInfo(person);}}
              title="Lihat Detail"
            >
              <FaInfoCircle />
            </button>
          </div>

          {/* PASANGAN (Jika ada) */}
          {spouse && (
            <>
              <div className="spouse-connector">❤</div>
              <div className="node-individual">
                <MemberCard person={spouse} onClick={handleNavigate} />
                <button 
                  className="mini-info-btn"
                  onClick={(e) => {e.stopPropagation(); onOpenInfo(spouse);}}
                  title="Lihat Detail"
                >
                  <FaInfoCircle />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
      {children.length > 0 && (
        <ul className="tree-children">
          {children.map(child => (
            <TreeNode key={child.id} person={child} family={family} onOpenInfo={onOpenInfo}/>
          ))}
        </ul>
      )}
    </li>
  );
};

// --- USER PAGE (AUTO CENTER SCROLL & FILTER HIDDEN) ---
const UserPage = ({ family }) => {
  const [infoModalData, setInfoModalData] = useState(null);
  const scrollContainerRef = useRef(null);

  // 1. FILTER: Hanya ambil anggota yang TIDAK disembunyikan
  const visibleFamily = family.filter(p => !p.hideFromTree);

  // LOGIKA AUTO CENTER SCROLL
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const centerPos = (scrollWidth - clientWidth) / 2;
      if (centerPos > 0) {
        scrollContainerRef.current.scrollLeft = centerPos;
      }
    }
  }, [visibleFamily]); 

  // 2. LOGIKA ROOT
  const roots = visibleFamily.filter(p => {
    const parentIsVisible = visibleFamily.find(f => f.id === p.parentId);
    if (parentIsVisible) return false;

    if (p.partnerId) {
      const partner = visibleFamily.find(f => f.id === p.partnerId);
      if (partner) {
        const partnerParentIsVisible = visibleFamily.find(f => f.id === partner.parentId);
        if (partnerParentIsVisible) return false;
        if (!partnerParentIsVisible && p.gender === 'female') return false; 
      }
    }
    return true;
  });

  return (
    <div className="user-page-container">
      <div className="page-header center">
        <h1>Pohon Silsilah Besar</h1>
        <p>Gunakan scroll di bawah/samping untuk melihat seluruh keluarga.</p>
        <p style={{fontSize: '0.8rem', color: '#f59e0b', marginTop: '5px', display: 'none'}} className="mobile-hint">
           💡 Tips: Gunakan layar Landscape (Miring) agar lebih luas.
        </p>
      </div>
      
      <div className="full-tree-wrapper" ref={scrollContainerRef}>
        {visibleFamily.length === 0 ? (
           <div className="empty-state"><div className="empty-icon"><FaTree /></div><h3>Pohon Belum Ditanam</h3><p>Data belum tersedia.</p></div>
        ) : (
          <div className="tree-container">
            <ul className="tree-root">
              {roots.length > 0 ? roots.map(root => (
                  <TreeNode key={root.id} person={root} family={visibleFamily} onOpenInfo={setInfoModalData} />
              )) : <div style={{padding:20, color:'red'}}>Error: Tidak ditemukan leluhur utama yang ditampilkan.</div>}
            </ul>
          </div>
        )}
      </div>
      <InfoModal person={infoModalData} onClose={() => setInfoModalData(null)} />
    </div>
  );
};

// --- ADMIN PAGE (FITUR: ANAK, PASANGAN, ORANG TUA) ---
const AdminPage = ({ family }) => {
  const initialFormState = { name: "", role: "", gender: "male", birth: "", isAlive: true, hideFromTree: false, location: "", phone: "", email: "", education: "" };
  const [form, setForm] = useState(initialFormState);
  const [photo, setPhoto] = useState("");
  
  // Type: child, partner, parent
  const [relationType, setRelationType] = useState("child");
  const [selectedRelativeId, setSelectedRelativeId] = useState("");
  const [editId, setEditId] = useState(null);
  const isFirstData = family.length === 0;

  const handleEditClick = (person) => {
    setEditId(person.id);
    setForm({ 
      name: person.name || "", role: person.role || "", gender: person.gender || "male", 
      birth: person.birth || "", isAlive: person.isAlive !== undefined ? person.isAlive : true,
      hideFromTree: person.hideFromTree || false, 
      location: person.location || "", phone: person.phone || "", email: person.email || "", education: person.education || "" 
    });
    setPhoto(person.photo || "");
    
    // Logika Edit
    if (person.parentId) { 
      setRelationType("child"); setSelectedRelativeId(person.parentId); 
    } else if (person.partnerId) { 
      setRelationType("partner"); setSelectedRelativeId(person.partnerId); 
    } else { 
      setRelationType("child"); setSelectedRelativeId(""); 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { 
    setEditId(null); setForm(initialFormState); setPhoto(""); setSelectedRelativeId(""); setRelationType("child");
  };

  const handleDelete = (id) => {
    if(window.confirm("Yakin hapus? Data yang terkait mungkin akan error.")) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputRelativeId = selectedRelativeId ? parseInt(selectedRelativeId) : null;
    let updatedFamily = [...family];

    if (editId) {
      // --- MODE EDIT ---
      updatedFamily = family.map(p => {
        if (p.id === editId) {
          const oldParentId = p.parentId !== undefined ? p.parentId : null;
          const oldPartnerId = p.partnerId !== undefined ? p.partnerId : null;
          const newParentId = (relationType === "child") ? inputRelativeId : null;
          const newPartnerId = (relationType === "partner") ? inputRelativeId : null;
          return {
            ...p, ...form, photo: photo,
            parentId: (!isFirstData && relationType === "child") ? newParentId : oldParentId,
            partnerId: (!isFirstData && relationType === "partner") ? newPartnerId : oldPartnerId
          };
        }
        return p;
      });
    } else {
      // --- MODE TAMBAH ---
      if (!isFirstData && !inputRelativeId) return alert("Pilih Anggota Keluarga yang Terkait!");
      const newId = Date.now();
      const newPerson = { id: newId, ...form, photo: photo, parentId: null, partnerId: null };

      if (relationType === 'child') {
        newPerson.parentId = inputRelativeId;
        updatedFamily.push(newPerson);
      } else if (relationType === 'partner') {
        newPerson.partnerId = inputRelativeId;
        updatedFamily.push(newPerson);
        updatedFamily = updatedFamily.map(p => {
            if (p.id === inputRelativeId) return { ...p, partnerId: newId };
            return p;
        });
      } else if (relationType === 'parent') {
        // Tambah Orang Tua di Atas
        newPerson.parentId = null; 
        updatedFamily.push(newPerson);
        // Update anak yang dipilih
        updatedFamily = updatedFamily.map(p => {
          if (p.id === inputRelativeId) return { ...p, parentId: newId };
          return p;
        });
      } else {
        updatedFamily.push(newPerson);
      }
    }

    const cleanFamily = updatedFamily.map(person => ({
        ...person,
        parentId: person.parentId === undefined ? null : person.parentId,
        partnerId: person.partnerId === undefined ? null : person.partnerId,
        isAlive: person.isAlive === undefined ? true : person.isAlive,
        hideFromTree: person.hideFromTree === undefined ? false : person.hideFromTree,
        role: person.role || "", email: person.email || "", phone: person.phone || "",
        location: person.location || "", education: person.education || "", photo: person.photo || ""
    }));

    set(ref(db, 'family'), cleanFamily).then(() => {
        alert("BERHASIL DISIMPAN! ✅");
        if(editId) handleCancelEdit();
        else { setForm(initialFormState); setPhoto(""); }
    }).catch((err) => { console.error(err); alert("GAGAL: " + err.message); });
  };
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleRelationTypeChange = (type) => {
    setRelationType(type);
    if (!editId) {
       let roleSuggestion = "";
       if (type === 'partner') roleSuggestion = (form.gender === 'female' ? 'Istri' : 'Suami');
       else if (type === 'child') roleSuggestion = "Anak";
       else if (type === 'parent') roleSuggestion = "Ayah/Ibu";
       setForm(prev => ({ ...prev, role: roleSuggestion }));
    }
  };

  // Helper Text Dropdown
  const getDropdownLabel = () => {
    if (relationType === 'child') return "Siapa Orang Tuanya?";
    if (relationType === 'partner') return "Siapa Pasangannya?";
    if (relationType === 'parent') return "Siapa Anaknya?";
    return "Pilih Anggota";
  };

  return (
    <div className="admin-container">
      <div className="page-header"><h1>Manajemen Data</h1><p>Halaman Rahasia Admin.</p><Link to="/" style={{color: 'var(--galur-blue)', fontWeight:'bold'}}>← Lihat Pohon Keluarga</Link></div>
      <div className="form-card">
        <div className="form-header"><h3>{editId ? `Edit: ${form.name}` : (isFirstData ? "Leluhur Utama" : "Tambah Anggota")}</h3>{editId && <button onClick={handleCancelEdit} className="cancel-badge">Batal</button>}</div>
        
        {!isFirstData && (
          <div style={{display:'flex', gap:'5px', marginBottom:'20px'}}>
            <button type="button" onClick={() => handleRelationTypeChange('child')} style={{flex:1, padding:'10px', background:relationType==='child'?'var(--galur-blue)':'#f1f5f9', color:relationType==='child'?'white':'black', border:'none', borderRadius:'8px', fontWeight:'bold', fontSize:'0.8rem'}}>Anak</button>
            <button type="button" onClick={() => handleRelationTypeChange('partner')} style={{flex:1, padding:'10px', background:relationType==='partner'?'var(--galur-pink)':'#f1f5f9', color:relationType==='partner'?'white':'black', border:'none', borderRadius:'8px', fontWeight:'bold', fontSize:'0.8rem'}}>Pasangan</button>
            <button type="button" onClick={() => handleRelationTypeChange('parent')} style={{flex:1, padding:'10px', background:relationType==='parent'?'#22c55e':'#f1f5f9', color:relationType==='parent'?'white':'black', border:'none', borderRadius:'8px', fontWeight:'bold', fontSize:'0.8rem'}}>Orang Tua</button>
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
          
          <div style={{background: '#fff7ed', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #ffedd5', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input type="checkbox" name="hideFromTree" checked={form.hideFromTree} onChange={handleChange} style={{width: '20px', height: '20px', margin: 0}} />
            <label style={{fontSize: '0.9rem', color: '#9a3412', fontWeight: 500}}>Sembunyikan dari Bagan (Tapi data tetap ada)</label>
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
              <option value="">-- {getDropdownLabel()} --</option>
              {family.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

          <button type="submit" className={`save-btn ${editId ? 'edit-mode' : ''}`}>{editId ? "Update Data" : "Simpan Data"}</button>
        </form>
      </div>
      <div className="members-list-container">
          <h3>📂 Database Cloud ({family.length})</h3>
            <div className="members-table">
              {family.map(person => (
                <div key={person.id} className="member-row">
                  <div className="member-row-info">
                     <img src={person.photo || "https://via.placeholder.com/40"} alt="avatar" />
                     <div>
                       <span className="row-name">{person.name} {person.hideFromTree && <span style={{fontSize:'0.7em', color:'red'}}>(Hidden)</span>}</span>
                       <span className="row-role">{person.role}</span>
                     </div>
                  </div>
                  <div className="member-row-actions">
                     <button onClick={() => handleEditClick(person)} className="action-btn edit"><FaEdit /></button>
                     <button onClick={() => handleDelete(person.id)} className="action-btn delete"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
      </div>
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
        <Navbar family={family} />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<UserPage family={family} />} />
            <Route path="/person/:id" element={<PersonDetailPage family={family} />} />
            <Route path="/admin" element={<AdminPage family={family} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;