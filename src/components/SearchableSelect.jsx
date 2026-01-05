import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './SearchableSelect.css';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    labelKey = "label",
    valueKey = "value",
    filterFunction = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => opt[valueKey] == value);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const filteredOptions = options.filter(option => {
        if (!searchTerm) return true;

        if (filterFunction) {
            return filterFunction(option, searchTerm);
        }

        const label = String(option[labelKey]).toLowerCase();
        const search = searchTerm.toLowerCase();
        return label.includes(search);
    });

    const handleSelect = (option) => {
        onChange(option[valueKey]);
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className="searchable-select-wrapper" ref={wrapperRef}>
            <div
                className={`searchable-select-control ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="searchable-select-value">
                    {selectedOption ? (
                        <span className="selected-text">{selectedOption[labelKey]}</span>
                    ) : (
                        <span className="placeholder-text">{placeholder}</span>
                    )}
                </div>
                <div className="searchable-select-actions">
                    {selectedOption && (
                        <div className="action-icon clear" onClick={clearSelection}>
                            <X size={14} />
                        </div>
                    )}
                    <div className="action-icon">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="searchable-select-dropdown">
                    <div className="searchable-select-search">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div className="searchable-select-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option[valueKey]}
                                    className={`searchable-select-option ${option[valueKey] == value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option[labelKey]}
                                </div>
                            ))
                        ) : (
                            <div className="searchable-select-empty">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
