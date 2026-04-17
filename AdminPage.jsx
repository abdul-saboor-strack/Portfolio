// AdminPage.jsx

import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import siteData from './siteData';

const AdminPage = () => {
    const [showExport, setShowExport] = useState(false);

    const handleShow = () => setShowExport(true);
    const handleClose = () => setShowExport(false);

    return (
        <div>
            <h1>Admin Page</h1>
            <Button variant="primary" onClick={handleShow}>Export Data</Button>

            <Modal show={showExport} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Export Site Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <pre>{JSON.stringify(siteData, null, 2)}</pre>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPage;