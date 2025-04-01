
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Script Swapper Portal
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Convert your Python applications to modern web interfaces
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Belote Score Tracker</CardTitle>
            <CardDescription>
              Track scores and manage games of Belote with this interactive score tracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/belote">
              <Button className="w-full">Launch Application</Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* More cards for other conversions can be added here */}
      </div>
    </div>
  );
};

export default Index;
