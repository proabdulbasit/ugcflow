// ... existing code ...
  const handleReview = async (deliverableId: string, status: 'approved' | 'rejected', feedback?: string) => {
    const { error } = await supabase
      .from('deliverables')
      .update({ status, feedback })
      .eq('id', deliverableId);

    if (error) {
      alert(error.message);
    } else {
      // Trigger Notification to Creator
      const deliverable = deliverables.find(d => d.id === deliverableId);
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', deliverable.creator_id)
        .single();

      if (creatorProfile) {
        await fetch('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            type: 'DELIVERABLE_REVIEWED',
            data: {
              creatorEmail: creatorProfile.email,
              creatorName: creatorProfile.full_name,
              campaignTitle: campaign.title,
              status,
              feedback,
              campaignId: id
            }
          })
        });
      }
      fetchData();
    }
  };
// ... existing code ...
