import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminAccessDenied.module.css';

export default function AdminAccessDenied({ module, action = 'read', requiredRole }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <ShieldAlert size={36} />
                </div>
                <div className={styles.badge}>Security Policy Enforced</div>
                <h1 className={styles.title}>Access Restricted</h1>
                <p className={styles.description}>
                    Your account does not possess the necessary institutional credentials or module-level permissions to access this view.
                </p>

                <div className={styles.details}>
                    <div><strong>Account:</strong> {user?.email || 'Authenticated User'} ({user?.role || 'Guest'})</div>
                    {module && <div><strong>Required Module:</strong> {module}</div>}
                    {action && <div><strong>Required Action:</strong> {action}</div>}
                    {requiredRole && <div><strong>Required Role:</strong> {requiredRole}</div>}
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate(-1)} className={styles.secondaryBtn}>
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <Link to="/admin" className={styles.primaryBtn}>
                        <Home size={16} />                                                 Events Management
                    </Link>
                </div>
            </div>
        </div>
    );
}
