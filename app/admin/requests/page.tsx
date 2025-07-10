"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Calendar, Search, Plus, User, Phone, Mail, XCircle, CheckCircle, MoreHorizontal } from "lucide-react";

// Helper to get badge by status
function getStatusBadge(status: string) {
  let color = "bg-gray-200 text-gray-700";
  if (status === "Pending") color = "bg-yellow-100 text-yellow-700";
  if (status === "Approved") color = "bg-green-100 text-green-700";
  if (status === "Rejected") color = "bg-red-100 text-red-700";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [programs, setPrograms] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchPrograms();
  }, []);

  async function fetchRequests() {
    // Fetch registrations with participant and program info
    const { data, error } = await supabase
      .from("registrations")
      .select(`id, registration_status, registration_date, participant_id, program_id, participants:participants(*), programs:programs(*)`)
      .order("registration_date", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to load requests", variant: "destructive" });
      return;
    }
    setRequests(data || []);
  }

  async function fetchPrograms() {
    const { data, error } = await supabase.from("programs").select("id, name");
    if (!error && data) setPrograms(data);
  }

  async function handleApprove(id: number) {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const { error } = await supabase
      .from("registrations")
      .update({ registration_status: "Approved" })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Request approved." });
      fetchRequests();
    }
  }

  async function handleReject(id: number) {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const { error } = await supabase
      .from("registrations")
      .update({ registration_status: "Rejected" })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Request rejected." });
      fetchRequests();
    }
  }

  // Filtering
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.participants?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.participants?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.participants?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.registration_status?.toLowerCase() === statusFilter;
    const matchesProgram =
      programFilter === "all" || request.programs?.name === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Program Join Requests</h2>
            <p className="text-gray-600 mt-1">Review and manage program join requests from participants.</p>
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.participants?.first_name} {request.participants?.last_name}
                      </h3>
                      {getStatusBadge(request.registration_status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Age: {request.participants?.age}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>Contact: {request.participants?.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email: {request.participants?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Requested: {new Date(request.registration_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Program: </span>
                      <span className="text-sm text-gray-600">{request.programs?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {request.registration_status === "Pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="text-gray-600 bg-transparent" disabled>
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
