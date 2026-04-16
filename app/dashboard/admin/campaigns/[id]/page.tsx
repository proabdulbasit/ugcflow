// ... existing imports ...

// Inside AdminCampaignDetail component, update assignCreator:
  const assignCreator = async (creatorId: string) => {
    const { error } = await supabase
      .from('campaign_creators')
      .insert({ campaign_id: id as string, creator_id: creatorId });

    if (error) {
      alert(error.message);
    } else {
      // Trigger Notification
      const creator = availableCreators.find(c => c.id === creatorId);
      await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'CREATOR_ASSIGNED',
          data: {
            creatorEmail: creator.profiles.email,
            creatorName: creator.profiles.full_name,
            campaignTitle: campaign.title,
            campaignId: id
          }
        })
      });
      window.location.reload();
    }
  };
// ...
