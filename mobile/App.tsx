import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Issue Category Types
type Category = 'plumbing' | 'electrical' | 'heating_and_cooling' | 'appliances' | 'general_maintenance';

interface TriageResult {
  issue_summary: string;
  category: Category;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  confidence: number;
  safety_flags: string[];
  missing_information: string[];
  recommended_actions: string[];
  recommended_contractor?: {
    name: string;
    company: string;
    match_score: number;
    response_time: string;
  };
  memory_recalled?: string;
}

export default function App() {
  const [tab, setTab] = useState<'intake' | 'triage' | 'work_orders'>('intake');
  const [property, setProperty] = useState('The Birches - 1420 Birches Way');
  const [unit, setUnit] = useState('204');
  const [category, setCategory] = useState<Category>('plumbing');
  const [description, setDescription] = useState('Water pooling again near bathroom floorboards behind the toilet wall.');
  const [loading, setLoading] = useState(false);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [workOrderStatus, setWorkOrderStatus] = useState<'Awaiting Approval' | 'Approved' | 'In Progress' | 'Completed'>('Awaiting Approval');

  // One-click demo loader
  const loadScenario = (type: 'routine' | 'high' | 'emergency' | 'unit204') => {
    if (type === 'routine') {
      setUnit('102');
      setCategory('general_maintenance');
      setDescription('Kitchen cabinet island handle is loose and wiggling when pulled.');
    } else if (type === 'high') {
      setUnit('305');
      setCategory('plumbing');
      setDescription('Active water leak under kitchen sink. Water is pooling across cabinet floorboards.');
    } else if (type === 'emergency') {
      setUnit('410');
      setCategory('heating_and_cooling');
      setDescription('Strong rotten egg sulfur gas odor near furnace closet with audible hissing sound.');
    } else if (type === 'unit204') {
      setUnit('204');
      setCategory('plumbing');
      setDescription('Water pooling again near bathroom floorboards behind the toilet wall.');
    }
    setTriage(null);
  };

  const handleRunTriage = () => {
    setLoading(true);

    // Simulate agent triage with deterministic safety and SurrealDB memory
    setTimeout(() => {
      const text = description.toLowerCase();
      let res: TriageResult;

      // Gas leak emergency
      if (text.includes('gas') || text.includes('sulfur') || text.includes('rotten egg')) {
        res = {
          issue_summary: 'Suspected natural gas leak in furnace closet with hissing pipe',
          category: 'heating_and_cooling',
          urgency: 'emergency',
          confidence: 0.99,
          safety_flags: ['CRITICAL: Explosive vapor hazard', 'High toxic inhalation danger', 'Immediate evacuation advised'],
          missing_information: ['Have all occupants evacuated the premises?'],
          recommended_actions: [
            'EMERGENCY GAS PROTOCOL: 1. Do NOT operate switches or electronics. 2. Evacuate building immediately. 3. Call 911 and gas utility from outside.',
          ],
        };
      }
      // Unit 204 Memory Recall
      else if (unit === '204') {
        res = {
          issue_summary: 'Recurring water leakage near bathroom floorboards',
          category: 'plumbing',
          urgency: 'high',
          confidence: 0.94,
          safety_flags: ['Sub-floor moisture risk & drywall mold hazard'],
          missing_information: ['Is water leaking from fixture valve or internal wall stack?'],
          recommended_actions: [
            'Prior repair memory active: Inspect adjacent main stack pipe corrosion rather than superficial valve patch',
            'Advise occupant to shut off water isolation valve if safe',
            'Fast-track plumber inspection',
          ],
          recommended_contractor: {
            name: 'Marco Rossi',
            company: 'Apex Master Plumbing & Drains',
            match_score: 95,
            response_time: 'Under 2 hours',
          },
          memory_recalled: 'SurrealDB Memory [CONFIRMED HISTORY]: Previous pipe replacement noted severe galvanic corrosion in main drywall stack.',
        };
      }
      // Routine
      else if (text.includes('cabinet') || text.includes('handle')) {
        res = {
          issue_summary: 'Loose kitchen cabinet hardware handle',
          category: 'general_maintenance',
          urgency: 'low',
          confidence: 0.95,
          safety_flags: [],
          missing_information: [],
          recommended_actions: ['Add to weekly batch maintenance', 'Tighten mounting screws'],
          recommended_contractor: {
            name: 'John Miller',
            company: 'Miller & Sons Property Maintenance',
            match_score: 95,
            response_time: 'Same day',
          },
        };
      }
      // General high plumbing
      else {
        res = {
          issue_summary: 'Active plumbing water leak causing standing water',
          category: 'plumbing',
          urgency: 'high',
          confidence: 0.92,
          safety_flags: ['Water damage to floorboards and lower suites'],
          missing_information: ['Can under-sink isolation valve be closed?'],
          recommended_actions: ['Close fixture supply valve', 'Dispatch emergency plumber prompt assessment'],
          recommended_contractor: {
            name: 'Marco Rossi',
            company: 'Apex Master Plumbing & Drains',
            match_score: 95,
            response_time: 'Under 2 hours',
          },
        };
      }

      setTriage(res);
      setLoading(false);
      setTab('triage');
    }, 600);
  };

  const handleApproveWorkOrder = () => {
    setWorkOrderStatus('Approved');
    Alert.alert('Work Order Approved', 'Manager sign-off recorded. Contractor notification queued.');
    setTab('work_orders');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Mobile App Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>FixIt AI Mobile</Text>
          <View style={styles.expoBadge}>
            <Text style={styles.expoBadgeText}>EXPO SDK</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Autonomous Maintenance Operations Agent</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'intake' && styles.tabButtonActive]}
          onPress={() => setTab('intake')}
        >
          <Text style={[styles.tabButtonText, tab === 'intake' && styles.tabButtonTextActive]}>
            1. Intake
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'triage' && styles.tabButtonActive]}
          onPress={() => setTab('triage')}
        >
          <Text style={[styles.tabButtonText, tab === 'triage' && styles.tabButtonTextActive]}>
            2. AI Triage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'work_orders' && styles.tabButtonActive]}
          onPress={() => setTab('work_orders')}
        >
          <Text style={[styles.tabButtonText, tab === 'work_orders' && styles.tabButtonTextActive]}>
            3. Work Orders
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* INTAKE TAB */}
        {tab === 'intake' && (
          <View style={styles.section}>
            {/* Quick Demo Scenario Switcher */}
            <Text style={styles.label}>PRELOAD DEMO SCENARIO</Text>
            <View style={styles.scenarioRow}>
              <TouchableOpacity
                style={[styles.scenarioChip, { backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}
                onPress={() => loadScenario('routine')}
              >
                <Text style={[styles.scenarioChipText, { color: '#166534' }]}>Routine</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scenarioChip, { backgroundColor: '#fef3c7', borderColor: '#fde047' }]}
                onPress={() => loadScenario('high')}
              >
                <Text style={[styles.scenarioChipText, { color: '#854d0e' }]}>Leak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scenarioChip, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}
                onPress={() => loadScenario('emergency')}
              >
                <Text style={[styles.scenarioChipText, { color: '#991b1b' }]}>🚨 Gas Leak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scenarioChip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
                onPress={() => loadScenario('unit204')}
              >
                <Text style={[styles.scenarioChipText, { color: '#1e40af' }]}>🧠 Unit 204</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <Text style={styles.fieldLabel}>Property</Text>
            <TextInput
              style={styles.input}
              value={property}
              onChangeText={setProperty}
              editable={false}
            />

            <Text style={styles.fieldLabel}>Unit / Suite</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g. 204"
            />

            <Text style={styles.fieldLabel}>Problem Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe the maintenance problem..."
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRunTriage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Run AI Triage Agent 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* AI TRIAGE TAB */}
        {tab === 'triage' && (
          <View style={styles.section}>
            {!triage ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Active Triage</Text>
                <Text style={styles.emptyText}>Go to Intake and tap &ldquo;Run AI Triage Agent&rdquo;.</Text>
                <TouchableOpacity style={styles.outlineButton} onPress={() => setTab('intake')}>
                  <Text style={styles.outlineButtonText}>Back to Intake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Emergency Banner if emergency */}
                {triage.urgency === 'emergency' && (
                  <View style={styles.emergencyBox}>
                    <Text style={styles.emergencyHeader}>🚨 CRITICAL SAFETY ESCALATION</Text>
                    <Text style={styles.emergencyBody}>
                      Deterministic safety rules detected a life-safety hazard. Routine scheduling suspended.
                    </Text>
                  </View>
                )}

                {/* SurrealDB Memory Highlight */}
                {triage.memory_recalled && (
                  <View style={styles.memoryBox}>
                    <Text style={styles.memoryHeader}>🧠 SurrealDB Agent Memory Recalled</Text>
                    <Text style={styles.memoryText}>{triage.memory_recalled}</Text>
                  </View>
                )}

                {/* Triage Summary Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Agent Triage Assessment</Text>
                    <View
                      style={[
                        styles.urgencyBadge,
                        triage.urgency === 'emergency'
                          ? styles.badgeEmergency
                          : triage.urgency === 'high'
                          ? styles.badgeHigh
                          : styles.badgeLow,
                      ]}
                    >
                      <Text style={styles.urgencyBadgeText}>{triage.urgency.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.issueSummary}>{triage.issue_summary}</Text>

                  {/* Safety Flags */}
                  {triage.safety_flags.length > 0 && (
                    <View style={styles.flagBox}>
                      <Text style={styles.flagTitle}>Safety Flags:</Text>
                      {triage.safety_flags.map((f, i) => (
                        <Text key={i} style={styles.flagItem}>• {f}</Text>
                      ))}
                    </View>
                  )}

                  {/* Missing Info Questions */}
                  {triage.missing_information.length > 0 && (
                    <View style={styles.missingBox}>
                      <Text style={styles.missingTitle}>Missing Information to Clarify:</Text>
                      {triage.missing_information.map((q, i) => (
                        <Text key={i} style={styles.missingItem}>• {q}</Text>
                      ))}
                    </View>
                  )}

                  {/* Recommended Actions */}
                  <Text style={styles.subHeading}>Action Plan:</Text>
                  {triage.recommended_actions.map((act, i) => (
                    <Text key={i} style={styles.actionItem}>{i + 1}. {act}</Text>
                  ))}
                </View>

                {/* Contractor Recommendation */}
                {triage.recommended_contractor && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Vetted Contractor Match</Text>
                    <Text style={styles.contractorName}>{triage.recommended_contractor.name}</Text>
                    <Text style={styles.contractorCompany}>{triage.recommended_contractor.company}</Text>
                    <Text style={styles.contractorMeta}>
                      Match Score: {triage.recommended_contractor.match_score}% • Response: {triage.recommended_contractor.response_time}
                    </Text>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleApproveWorkOrder}
                    >
                      <Text style={styles.primaryButtonText}>✓ Approve & Create Work Order</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* WORK ORDERS TAB */}
        {tab === 'work_orders' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Work Order WO_204_A</Text>
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>{workOrderStatus}</Text>
                </View>
              </View>
              <Text style={styles.issueSummary}>
                {triage?.issue_summary || 'Bathroom floorboards water leak investigation'}
              </Text>
              <Text style={styles.contractorMeta}>
                Unit 204 • Assigned Manager: Alex Morgan • Contractor: Apex Master Plumbing
              </Text>
              <View style={styles.auditBadge}>
                <Text style={styles.auditText}>✓ Human Sign-off recorded on mobile device</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  expoBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  expoBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  scenarioRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  scenarioChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  scenarioChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emergencyBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  emergencyHeader: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  emergencyBody: {
    color: '#7f1d1d',
    fontSize: 11,
    lineHeight: 16,
  },
  memoryBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  memoryHeader: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  memoryText: {
    color: '#1e3a8a',
    fontSize: 11,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  issueSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeEmergency: {
    backgroundColor: '#dc2626',
  },
  badgeHigh: {
    backgroundColor: '#ea580c',
  },
  badgeLow: {
    backgroundColor: '#64748b',
  },
  urgencyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  flagBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  flagTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  flagItem: {
    fontSize: 11,
    color: '#78350f',
  },
  missingBox: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  missingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },
  missingItem: {
    fontSize: 11,
    color: '#0c4a6e',
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6,
    marginBottom: 4,
  },
  actionItem: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  contractorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  contractorCompany: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  contractorMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  outlineButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeSuccessText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  auditBadge: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  auditText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
  },
});
