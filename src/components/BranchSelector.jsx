import React from 'react';
import { useBranch } from '../context/BranchContext';
import { MapPin, ChevronDown } from 'lucide-react';
import './Button.css'; // Reusing button styles for simplicity if needed, or inline

const BranchSelector = () => {
    const { branches, selectedBranchId, switchBranch, loading } = useBranch();

    if (loading || branches.length <= 1) return null;

    return (
        <div style={{ position: 'relative', minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <select
                    value={selectedBranchId || ''}
                    onChange={(e) => switchBranch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 32px 8px 36px',
                        appearance: 'none',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                            {branch.nombre}
                        </option>
                    ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
            </div>
        </div>
    );
};

export default BranchSelector;
