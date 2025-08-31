import { useState } from 'react';
import { Card } from '../lib/types';

interface AddCardModalProps {
    onClose: () => void;
    onAddCard: (cardData: Omit<Card, 'id'>) => void;
    onImportCards: (cards: Card[]) => void;
    onExportCards: () => void;
}

export const AddCardModal = ({ onClose, onAddCard, onImportCards, onExportCards }: AddCardModalProps) => {
    const [mode, setMode] = useState<'manual' | 'json' | 'export'>('manual');
    const [formData, setFormData] = useState<Omit<Card, 'id'>>({
        kapitel: 1,
        de: { word: '', explanation: '', example: '', synonym: '' },
        bs: { word: '', explanation_translation: '', example_translation: '' },
    });
    const [jsonText, setJsonText] = useState('');

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.de.word || !formData.bs.word) {
            alert("Riječ na njemačkom i bosanskom su obavezna polja.");
            return;
        }
        onAddCard(formData);
        onClose();
    };

    const handleJsonImport = () => {
        try {
            const result = JSON.parse(jsonText);
            if (Array.isArray(result) && result.every(item => 'id' in item && 'de' in item && 'bs' in item)) {
                onImportCards(result as Card[]);
                alert(`${result.length} kartica uspješno uvezeno!`);
                onClose();
            } else {
                throw new Error("Nevažeći format JSON datoteke.");
            }
        } catch (error) {
            alert(`Greška pri uvozu: ${error}`);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setJsonText(e.target?.result as string);
        reader.readAsText(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const [lang, field] = name.split('.');
        if (lang === 'de' || lang === 'bs') {
            setFormData(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'kapitel' ? Number(value) : value }));
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-tabs">
                    <button className={`modal-tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>Ručni unos</button>
                    <button className={`modal-tab ${mode === 'json' ? 'active' : ''}`} onClick={() => setMode('json')}>JSON uvoz</button>
                    <button className={`modal-tab ${mode === 'export' ? 'active' : ''}`} onClick={() => setMode('export')}>JSON izvoz</button>
                </div>

                {mode === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="modal-form">
                        <div className="form-section">
                            <input name="de.word" value={formData.de.word} onChange={handleChange} placeholder="Riječ (DE)" required />
                            <textarea name="bs.explanation_translation" value={formData.bs.explanation_translation} onChange={handleChange} placeholder="Prevod objašnjenja (BS)" />
                            <textarea name="de.example" value={formData.de.example} onChange={handleChange} placeholder="Primjer (DE)" />
                        </div>
                        <div className="form-section">
                            <input name="bs.word" value={formData.bs.word} onChange={handleChange} placeholder="Riječ (BS)" required />
                            <input name="de.synonym" value={formData.de.synonym} onChange={handleChange} placeholder="Sinonim (DE)" />
                            <textarea name="de.explanation" value={formData.de.explanation} onChange={handleChange} placeholder="Objašnjenje (DE)" />
                            <textarea name="bs.example_translation" value={formData.bs.example_translation} onChange={handleChange} placeholder="Prevod primjera (BS)" />
                        </div>
                        <select name="kapitel" value={formData.kapitel} onChange={handleChange}>
                            {[...Array(20)].map((_, i) => <option key={i+1} value={i+1}>Kapitel {i+1}</option>)}
                        </select>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-modal-cancel">Odustani</button>
                            <button type="submit" className="btn-modal-save">Sačuvaj</button>
                        </div>
                    </form>
                )}

                {mode === 'json' && (
                    <div className="modal-form">
                        <p>Zalijepite sadržaj JSON datoteke ili je odaberite.</p>
                        <textarea className="json-textarea" value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='[ { "id": "c1", ... } ]'></textarea>
                        <label className="btn-modal-upload">
                            Odaberi JSON fajl
                            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
                        </label>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-modal-cancel">Odustani</button>
                            <button type="button" onClick={handleJsonImport} className="btn-modal-save">Uvezi</button>
                        </div>
                    </div>
                )}

                {mode === 'export' && (
                    <div className="modal-form">
                        <p>Kliknite na dugme da preuzmete sve vaše kartice kao JSON datoteku.</p>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-modal-cancel">Odustani</button>
                            <button type="button" onClick={onExportCards} className="btn-modal-save">Preuzmi</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};