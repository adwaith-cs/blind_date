export interface GroundDependent {
  name: string;
  type: 'telemedicine' | 'emergency_response' | 'wildfire_telemetry' | 'water_grid' | 'ground_station';
  location: string;
  lat: number;
  lng: number;
  popAtRisk: string;
  failoverStatus: 'active' | 'standby' | 'compromised';
}

export interface OrbitalTarget {
  id: string;
  name: string;
  noradId: number;
  type: 'satellite' | 'debris' | 'rocket_body';
  tleLine1: string;
  tleLine2: string;
  altitudeKm: number;
  inclinationDeg: number;
  velocityKmS: number;
  criticalGroundDependents: GroundDependent[];
}

export interface ManeuverVector {
  deltaVx_ms: number;
  deltaVy_ms: number;
  deltaVz_ms: number;
  totalDeltaV_ms: number;
  propellantRequiredKg: number;
  burnDurationSec: number;
  newSafePerigeeKm: number;
}

export interface VulnerableAsset {
  facility: string;
  category: string;
  location: string;
  blackoutImpact: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GroundAlertDispatched {
  channel: string;
  recipientGroup: string;
  smsPayload: string;
  sentTimestamp: string;
}

export interface AgentRunResult {
  missionSummary: string;
  coordinatorAgent: {
    agentName: string;
    status: string;
    goal: string;
    thoughtLog: string[];
    delegatedTasks: string[];
  };
  debrisMlAgent: {
    agentName: string;
    status: string;
    mathModel: string;
    timeToClosestApproachMinutes: number;
    missDistanceMeters: number;
    relativeVelocityKmS: number;
    collisionProbability: number;
    riskLevel: 'CRITICAL' | 'ELEVATED' | 'NOMINAL';
    maneuverVector: ManeuverVector;
    reasoningSteps: string[];
  };
  groundImpactAgent: {
    agentName: string;
    status: string;
    vectorSearchQuery: string;
    vulnerableAssets: VulnerableAsset[];
    totalLivesAtRisk: string;
    serviceContinuityStatus: string;
  };
  responseAutomationAgent: {
    agentName: string;
    status: string;
    actionTriggered: boolean;
    deltaVBurnScript: string;
    groundAlertDispatched: GroundAlertDispatched;
    failoverRoute: string;
    mitigationSummary: string;
  };
}

export interface MapLink {
  title: string;
  uri: string;
}

export interface MapsGroundingResult {
  analysis: string;
  groundingChunks: any[];
  mapLinks: MapLink[];
}
