import { bottom } from '@popperjs/core'
import './css/Common.css'
import './css/Header.css'
import {Link} from 'react-router-dom'
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './security/AuthContext'
import { useState, useEffect } from 'react';
import { suggestTitles } from './api/TalksApiService';

export default function HeaderComponent(){
    const navigate = useNavigate();
    const authContext = useAuth()
    const logout = authContext.logout;
    const [searchInput, setSearchInput] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);

    useEffect(() => {
        if (!searchInput) {
            setSearchSuggestions([]);
            return;
        }
        const timer = setTimeout(() => {
            suggestTitles(searchInput)
                .then(res => setSearchSuggestions(res))
                .catch(err => console.error(err));
        }, 300); // debounce
    
        return () => clearTimeout(timer);
    }, [searchInput]);

    return(
        <nav className="navbar navbar-expand-lg bg-purple">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"></link>
            <div className="container-fluid">

                    <a className="navbar-brand pixel_font text-light talks_t me-4 padding_l" href="#"  onClick={() => navigate('/mainPage')}>Talks</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse padding_r" id="navbarSupportedContent">
                        {/* 搜尋框區塊 */}
                        <div className="me-auto position-relative search-bar-container" style={{ width: '300px' }}>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="搜尋文章標題..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchInput.trim()) {
                                      navigate(`/search?title=${encodeURIComponent(searchInput)}`);
                                      setSearchSuggestions([]); // 清空補字
                                    }
                                }}
                                autoComplete="off"
                            />
                            <i 
                                className="bi bi-search search-icon search-icon-right" 
                                onClick={() => {
                                    if (searchInput.trim()) {
                                      navigate(`/search?title=${encodeURIComponent(searchInput)}`);
                                      setSearchSuggestions([]); // 清空補字
                                    }
                                }}
                            />

                            {searchSuggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 10 }}>
                                    {searchSuggestions.map((title, idx) => (
                                        <li key={idx} className="list-group-item list-group-item-action"
                                            onClick={() => {
                                                setSearchInput(title);
                                                setSearchSuggestions([]);
                                                navigate(`/search?title=${encodeURIComponent(title)}`);
                                            }}>
                                            {title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        


                        <ul className="d-flex align-items-center navbar-nav mb-2 mb-lg-0 ms-auto">
                            <li className="nav-item ms-5 me-0">
                                <Link className="nav-link each_icon" to="/edit/-1">
                                    <i className="bi bi-pencil-fill" style={{ fontSize: '32px' }} ></i>
                                </Link>
                            </li>

                            <li className="nav-item ms-5 each_icon">
                                <i className="bi bi-person-fill" style={{ fontSize: '40px' }}></i>
                            </li>

                            <Dropdown className="mt-2">
                                <Dropdown.Toggle className="btn drop_bg" id="dropdownMenu2">
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-menu-end">
                                    <Dropdown.Item onClick={() => navigate('/update')}>setting</Dropdown.Item>
                                    <Dropdown.Item onClick={logout}>log out</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ul>
                    </div>
        </nav>
    )
}