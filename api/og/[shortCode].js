const { ImageResponse } = require('@vercel/og');
const { supabaseAdmin } = require('../../lib/supabase-auth');

/**
 * Generate dynamic OG image for shared trip
 * GET /api/og/:shortCode
 * Returns: PNG image (1200x630)
 */
module.exports = async (req, res) => {
  try {
    const { shortCode } = req.query;

    if (!shortCode) {
      return res.status(400).json({ error: 'Missing shortCode parameter' });
    }

    // Fetch trip data from Supabase
    const { data: shareData, error: shareError } = await supabaseAdmin
      .from('trips_shared')
      .select('trip_id, user_id')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (shareError || !shareData) {
      // Return fallback image
      return generateFallbackImage(res);
    }

    // For now, use hardcoded trip data (in production, fetch from trips table)
    // You would typically store trip metadata in a trips table
    const tripData = {
      title: 'Japan Cherry Blossom Trip',
      destination: 'Tokyo • Kyoto • Osaka • Nara',
      duration: '14 Days',
      highlights: ['Shibuya Crossing', 'Fushimi Inari', 'Osaka Castle']
    };

    // Generate Mapbox static map image URL
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    const bbox = '138.7,35.0,140.9,35.7'; // Tokyo-Kyoto-Osaka region
    const mapUrl = mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${bbox}/600x400@2x?access_token=${mapboxToken}&logo=false`
      : null;

    // Generate OG image using @vercel/og
    const imageResponse = new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, sans-serif'
          },
          children: [
            // Header with gradient
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: '100%',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 60px'
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: 'white'
                      },
                      children: '🗾 Trip Companion'
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '20px',
                        color: 'white',
                        opacity: 0.9
                      },
                      children: tripData.duration
                    }
                  }
                ]
              }
            },
            // Main content
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: '100%',
                  flex: 1,
                  padding: '60px'
                },
                children: [
                  // Left side - Text content
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        paddingRight: '40px',
                        justifyContent: 'center'
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '48px',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              marginBottom: '20px',
                              lineHeight: 1.2
                            },
                            children: tripData.title
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '28px',
                              color: '#667eea',
                              marginBottom: '30px',
                              fontWeight: '600'
                            },
                            children: tripData.destination
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '20px',
                              color: '#666666',
                              lineHeight: 1.6
                            },
                            children: tripData.highlights.join(' • ')
                          }
                        }
                      ]
                    }
                  },
                  // Right side - Map or image placeholder
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '400px',
                        height: '400px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e5e7eb'
                      },
                      children: mapUrl
                        ? {
                            type: 'img',
                            props: {
                              src: mapUrl,
                              style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }
                            }
                          }
                        : {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '72px'
                              },
                              children: '🗺️'
                            }
                          }
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        width: 1200,
        height: 630
      }
    );

    // Set proper headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return imageResponse;

  } catch (error) {
    console.error('Error generating OG image:', error);
    return generateFallbackImage(res);
  }
};

function generateFallbackImage(res) {
  const fallbackResponse = new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '64px',
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif'
        },
        children: '🗾 Trip Companion'
      }
    },
    {
      width: 1200,
      height: 630
    }
  );

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  return fallbackResponse;
}
