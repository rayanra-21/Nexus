import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bell,
  Calendar,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Wallet,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CollaborationRequestCard } from "../../components/collaboration/CollaborationRequestCard";
import { InvestorCard } from "../../components/investor/InvestorCard";
import { useAuth } from "../../context/AuthContext";
import { CollaborationRequest } from "../../types";
import { getRequestsForEntrepreneur } from "../../data/collaborationRequests";
import { investors } from "../../data/users";
import { getWalletBalance } from "../../data/wallet";
import Walkthrough from "../../components/Walkthrough/walkthrough";


import MeetingCalendar, {
  CalendarEvent,
} from "../MeetingCalender/MeetingCalender";

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();

  const [collaborationRequests, setCollaborationRequests] = useState<
    CollaborationRequest[]
  >([]);
  const [recommendedInvestors] = useState(investors.slice(0, 3));

  const [showCalendar, setShowCalendar] = useState(false);
  const [meetingEvents, setMeetingEvents] = useState<CalendarEvent[]>([]);

  const walletBalance = getWalletBalance();

  const confirmedMeetings = meetingEvents.filter(
    (e) => e.status === "confirmed"
  ).length;

  useEffect(() => {
    if (user) {
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
    }
  }, [user]);

  const handleRequestStatusUpdate = (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    setCollaborationRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req))
    );
  };

  if (!user) return null;

  const pendingRequests = collaborationRequests.filter(
    (req) => req.status === "pending"
  );

  return (
    <div className="space-y-6 animate-fade-in">
  <Walkthrough />
      {/* Welcome + Find Investors */}
    <div className="flex justify-between items-center tour-welcome">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your startup today
          </p>
        </div>

        <Link to="/investors"  className="tour-find-investors">
          <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
  
  <Card className="bg-primary-50 border border-primary-100 h-full">
    <CardBody className="flex items-center gap-4 h-full">
      <div className="p-3 bg-primary-100 rounded-full">
        <Bell size={20} className="text-primary-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary-700">Pending Requests</p>
        <h3 className="text-xl font-semibold text-primary-900">
          {pendingRequests.length}
        </h3>
      </div>
    </CardBody>
  </Card>

  <Card className="bg-primary-50 border border-primary-100 tour-wallet">
    <CardBody className="flex items-center gap-4 h-full">
      <div className="p-3 bg-primary-100 rounded-full">
        <Wallet size={20} className="text-primary-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary-700">Wallet Balance</p>
        <h3 className="text-xl font-semibold text-primary-900">
          ${walletBalance.toLocaleString()}
        </h3>
      </div>
    </CardBody>
  </Card>

  <Card className="bg-secondary-50 border border-secondary-100 h-full">
    <CardBody className="flex items-center gap-4 h-full">
      <div className="p-3 bg-secondary-100 rounded-full">
        <Users size={20} className="text-secondary-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-secondary-700">Total Connections</p>
        <h3 className="text-xl font-semibold text-secondary-900">
          {collaborationRequests.filter((r) => r.status === "accepted").length}
        </h3>
      </div>
    </CardBody>
  </Card>

  <Card
     className="bg-accent-50 border border-accent-100 cursor-pointer hover:shadow-md transition tour-calendar"
    onClick={() => setShowCalendar(true)}
  >
    <CardBody className="flex items-center gap-4 h-full">
      <div className="p-3 bg-accent-100 rounded-full">
        <Calendar size={20} className="text-accent-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
        <h3 className="text-xl font-semibold text-accent-900">
          {confirmedMeetings}
        </h3>
      </div>
    </CardBody>
  </Card>

  <Card className="bg-success-50 border border-success-100 h-full">
    <CardBody className="flex items-center gap-4 h-full">
      <div className="p-3 bg-green-100 rounded-full">
        <TrendingUp size={20} className="text-success-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-success-700">Profile Views</p>
        <h3 className="text-xl font-semibold text-success-900">24</h3>
      </div>
    </CardBody>
  </Card>

</div>

      {/* Collaboration Requests + Recommended Investors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration Requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="tour-collab-requests">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Collaboration Requests
              </h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>

            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map((r) => (
                    <CollaborationRequestCard
                      key={r.id}
                      request={r}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recommended Investors */}
        <div className="space-y-4">
          <Card className="tour-recommended-investors">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Recommended Investors
              </h2>

              <Link
                to="/investors"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardHeader>

            <CardBody className="space-y-4">
              {recommendedInvestors.map((i) => (
                <InvestorCard key={i.id} investor={i} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-5xl shadow-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Meetings Calendar
              </h2>

              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-600 hover:text-gray-900 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <MeetingCalendar
                events={meetingEvents}
                setEvents={setMeetingEvents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrepreneurDashboard;
