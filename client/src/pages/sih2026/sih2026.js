import React, { useEffect, useState } from 'react';
import styles from './sih2026.module.css';
import { supabase } from '../../lib/supabase';

function Sih2026() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('sih_2026_registrations')
          .select('*')
          .order('batch_id', { ascending: true });

        if (error) {
          throw error;
        }

        setTeams((data || []).map((participant) => ({
          id: participant.batch_id
            ? `B${participant.batch_id.toString().padStart(3, '0')}`
            : participant.id.toString(),
          name: participant.team_lead_name || 'Unknown Team',
          email: participant.email || participant.team_lead_email || 'N/A',
          branch: participant.branch || 'N/A',
          register_number: participant.register_number || 'N/A',
          faculty: participant.faculty_assigned || 'N/A',
          iic_coordinator: participant.iic_coordinator_assigned || 'N/A',
          date: participant.review_date || participant.reviewed_at?.split('T')[0] || 'N/A',
          status: participant.review_status?.toLowerCase() === 'completed'
            ? 'Completed'
            : 'Pending'
        })));
      } catch (error) {
        console.error('Error fetching SIH registrations from Supabase:', error);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const filteredData = teams.filter((team) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      team.name.toLowerCase().includes(search) ||
      team.email.toLowerCase().includes(search) ||
      team.id.toLowerCase().includes(search) ||
      team.branch.toLowerCase().includes(search) ||
      team.register_number.toLowerCase().includes(search)
    );
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>SIH 2026</h1>

      <div className={styles.searchContainer} style={{ margin: 0 }}>
        <input
          type="text"
          placeholder="Search teams, ID, branch..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Register Number</th>
              <th>Registered Mail</th>
              <th>Faculty Assigned</th>
              <th>IIC Co-ordinator</th>
              <th>Date of Review</th>
              <th>Review Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" className={styles.noData}>Loading participants...</td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((team) => (
                <tr key={team.id}>
                  <td data-label="Batch ID">{team.id}</td>
                  <td data-label="Name" className={styles.teamName}>{team.name}</td>
                  <td data-label="Email">{team.email}</td>
                  <td data-label="Branch">{team.branch}</td>
                  <td data-label="Register Number">{team.register_number}</td>
                  <td data-label="Registered Mail">{team.email}</td>
                  <td data-label="Faculty Assigned">{team.faculty}</td>
                  <td data-label="IIC Co-ordinator">{team.iic_coordinator}</td>
                  <td data-label="Date of Review">{team.date}</td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${
                      team.status === 'Completed' ? styles.completed : styles.pending
                    }`}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className={styles.noData}>No matching teams found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sih2026;
